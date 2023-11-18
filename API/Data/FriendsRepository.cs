using Microsoft.EntityFrameworkCore;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper.QueryableExtensions;
using AutoMapper;

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
            .FirstOrDefaultAsync(f => f.InviterId == inviterId && f.InviteeId == inviteeId);
    }

    public async Task<IEnumerable<FriendshipDto>> GetActiveFriends(int userId)
    {
        var friendships = await _context.Friendships
            .Include(f => f.Invitee)
            .Include(f => f.Invitee.Avatar)
            .Include(f => f.Inviter)
            .Include(f => f.Inviter.Avatar)
            .Where(f => (f.InviterId == userId || f.InviteeId == userId) && f.Status == 0)
            .ToListAsync();

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

    public Task<IEnumerable<Friendship>> GetFriendRequests(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<AppUser> GetUserWithInvitees(int userId)
    {
        return await _context.Users
            .Include(u => u.Invitees)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
