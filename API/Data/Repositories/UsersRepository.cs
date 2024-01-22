using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.Helpers;
using API.DTOs;
using API.Enums;

namespace API.Data;

public class UsersRepository : IUsersRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public UsersRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        return await _context.Users
            .SingleOrDefaultAsync(user => user.Id == id);
    }

    public async Task<AppUser> GetUserByUsernameAsync(string userName)
    {
        return await _context.Users
            .Include(u => u.Avatar)
            .Include(u => u.Publications)
            .SingleOrDefaultAsync(user => user.UserName == userName);
    }
    
    public async Task<PlayerDto> GetPlayerAsync(int currentUserId, string requestedUserName)
    {
        var player = await _context.Users
            .Where(u => u.UserName == requestedUserName)
            .ProjectTo<PlayerDto>(_mapper.ConfigurationProvider)
            .AsSplitQuery()
            .AsNoTracking()
            .SingleOrDefaultAsync();

        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => 
                (f.InviterId == currentUserId && f.Invitee.UserName == requestedUserName) ||
                (f.InviteeId == currentUserId && f.Inviter.UserName == requestedUserName)
            );

        player.Status = friendship == null ? FriendStatus.None : friendship.Status;

        player.Type = player.Status switch
        {
            FriendStatus.Pending => friendship.InviterId == currentUserId ? 
                FriendRequestType.Outcome : FriendRequestType.Income,
                
            _ => FriendRequestType.All
        };

        return player;
    }

    public async Task<PagedList<PlayerDto>> GetPlayersAsync(
        PaginationParams paginationParams, int currentUserId)
    {     
        var query = _context.Users.AsQueryable();
        
        query = query.Where(u => u.Id != currentUserId && u.UserName != "Admin");
        query = paginationParams.OrderType switch
        {
            OrderType.MostPublicated => query.OrderByDescending(u => u.Publications.Count),
            OrderType.LessPublicated => query.OrderBy(u => u.Publications.Count),
            OrderType.MostReviewed => query.OrderByDescending(u => u.Reviews.Count),
            OrderType.LessReviewed => query.OrderBy(u => u.Reviews.Count),
            OrderType.ZA => query.OrderByDescending(u => u.UserName),
            _ => query.OrderBy(u => u.UserName)
        };

        var players = await PagedList<PlayerDto>.CreateAsync
        (
            query.AsSplitQuery().AsNoTracking().ProjectTo<PlayerDto>(_mapper.ConfigurationProvider), 
            paginationParams.CurrentPage, 
            paginationParams.ItemsPerPage
        );

        var playerIds = players.Select(u => u.Id).ToList();

        var friendships = await _context.Friendships
            .Where(f => 
                (f.InviterId == currentUserId && playerIds.Contains(f.InviteeId)) ||
                (f.InviteeId == currentUserId && playerIds.Contains(f.InviterId))
            )
            .ToListAsync();

        foreach (var player in players)
        {
            var friendship = friendships.Find(f => f.InviterId == player.Id || f.InviteeId == player.Id);
            player.Status = friendship == null ? FriendStatus.None : friendship.Status;
            player.Type = player.Status switch
            {
                FriendStatus.Pending => friendship.InviterId == currentUserId ? 
                    FriendRequestType.Outcome : FriendRequestType.Income,
                    
                _ => FriendRequestType.All
            };
        }

        return players;
    }

    public async Task RegisterLastActivity(string username)
    {
        var user = await GetUserByUsernameAsync(username);
        user.LastActive = DateTime.UtcNow;
    }
}
