using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Helpers;

namespace API.Data;

public class FriendsRepository : IFriendsRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public FriendsRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Friendship> GetFriendship(int inviterId, int inviteeId)
    {
        return await _context.Friendships
            .FirstOrDefaultAsync(f => 
                (f.InviterId == inviterId && f.InviteeId == inviteeId) ||
                (f.InviteeId == inviterId && f.InviterId == inviteeId)
            );
    }

    public async Task<AppUser> GetUserWithFriends(int userId)
    {
        return await _context.Users
            .Include(u => u.Inviters)
            .Include(u => u.Invitees)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<PagedList<PlayerDto>> GetPlayersAsync(
        PaginationParams paginationParams, int currentUserId)
    {     
        var query = _context.Users.AsQueryable();
        query = query.Where(u => u.Id != currentUserId && u.UserName != "Admin");
        query = paginationParams.OrderBy switch
        {
            "za" => query.OrderByDescending(u => u.UserName),
            _ => query.OrderBy(u => u.UserName)
        };

        var players = await PagedList<PlayerDto>.CreateAsync
        (
            query.ProjectTo<PlayerDto>(_mapper.ConfigurationProvider).AsNoTracking(), 
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
    
    public async Task<PlayerDto> GetPlayerAsync(int currentUserId, string requestedUserName)
    {
        var player = await _context.Users
            .Where(u => u.UserName == requestedUserName)
            .ProjectTo<PlayerDto>(_mapper.ConfigurationProvider)
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

    public async Task<IEnumerable<PlayerDto>> GetFriendsAsync(int userId)
    {
        var friendships = await _context.Friendships
            .Include(f => f.Invitee)
            .Include(f => f.Inviter.Avatar)
            .Include(f => f.Inviter)            
            .Include(f => f.Invitee.Avatar)
            .Where(f => f.InviterId == userId || f.InviteeId == userId)
            .ToListAsync();

        var friends = new List<PlayerDto>();
        foreach (var friendship in friendships)
        {
            var friend = _mapper.Map<PlayerDto>
            (
                userId == friendship.InviterId ? friendship.Invitee : friendship.Inviter
            );

            friend.Status = friendship.Status;

            friend.Type = friendship.Status switch
            {
                FriendStatus.Pending => friendship.InviterId == userId ? 
                    FriendRequestType.Outcome : FriendRequestType.Income,

                _ => FriendRequestType.All
            };

            friends.Add(friend);
        }
        return friends;
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
