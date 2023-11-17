using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class FriendsRepository : IFriendsRepository
{
    private readonly DataContext _context;

    public FriendsRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<Friendship> GetFriendship(int inviterId, int inviteeId)
    {
        return await _context.Friendships
            .FirstOrDefaultAsync(f => f.InviterId == inviterId && f.InviteeId == inviteeId);
    }

    public Task<IEnumerable<Friendship>> GetInviters(int userId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Friendship>> GetInvitees(int gameId)
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
