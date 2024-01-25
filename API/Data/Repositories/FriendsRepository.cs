using Microsoft.EntityFrameworkCore;
using AutoMapper;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Enums;

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

    public async Task<Friendship> GetFriendshipAsync(int inviterId, int inviteeId)
    {
        return await _context.Friendships
            .FirstOrDefaultAsync(f => 
                (f.InviterId == inviterId && f.InviteeId == inviteeId) ||
                (f.InviteeId == inviterId && f.InviterId == inviteeId)
            );
    }

    public async Task<AppUser> GetUserWithFriendsAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Avatar)
            .Include(u => u.Inviters)
            .Include(u => u.Invitees)
            .FirstOrDefaultAsync(u => u.Id == userId);
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

    public async Task<List<int>> GetActiveFriendsAsync(int userId)
    {
        return await _context.Friendships
            .Where(f => (f.InviterId == userId || f.InviteeId == userId) && f.Status == FriendStatus.Active)
            .Select(f => f.InviterId == userId ? f.InviteeId : f.InviterId)
            .ToListAsync();
    }
}
