using Microsoft.EntityFrameworkCore;
using AutoMapper;
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

    public async Task<FriendshipDto> GetFriend(int currentUserId, int candidateId)
    {
        var friendship = await _context.Friendships
            .Include(f => f.Invitee)
            .Include(f => f.Invitee.Avatar)
            .Include(f => f.Inviter)
            .Include(f => f.Inviter.Avatar)
            .FirstOrDefaultAsync(f => 
                (f.InviterId == currentUserId && f.InviteeId == candidateId) ||
                (f.InviteeId == currentUserId && f.InviterId == candidateId)
            );

        if (friendship == null) return null;
        
        return new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>
            (
               candidateId == friendship.InviteeId ? friendship.Invitee : friendship.Inviter
            ),
            Status = friendship.Status
        };
    }

    public async Task<IEnumerable<FriendshipDto>> GetFriends(int userId, 
        FriendStatus status, FriendRequestType type)
    {
        var query = _context.Friendships
            .Include(f => f.Invitee)
            .Include(f => f.Invitee.Avatar)
            .Include(f => f.Inviter)
            .Include(f => f.Inviter.Avatar)
            .Where(f => f.Status == status)
            .AsQueryable();

        query = type switch
        {
            FriendRequestType.All => query.Where(f => f.InviterId == userId || f.InviteeId == userId),
            FriendRequestType.Income => query.Where(f => f.InviteeId == userId),
            FriendRequestType.Outcome => query.Where(f => f.InviterId == userId),
            _ => query
        };

        return ProjectToFriendshipDto(await query.ToListAsync(), userId);
    }

    public async Task<AppUser> GetUserWithFriends(int userId)
    {
        return await _context.Users
            .Include(u => u.Inviters)
            .Include(u => u.Invitees)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    private List<FriendshipDto> ProjectToFriendshipDto(IEnumerable<Friendship> friendships, int userId)
    {
        var friends = new List<FriendshipDto>();
        foreach (var friendship in friendships)
        {
            friends.Add(new FriendshipDto
            {
                Player = _mapper.Map<PlayerDto>
                (
                   userId == friendship.InviterId ? friendship.Invitee : friendship.Inviter
                ),
                Status = friendship.Status
            });
        }
        return friends;
    }
}
