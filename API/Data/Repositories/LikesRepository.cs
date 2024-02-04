using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.Interfaces;

namespace API.Data;

public class LikesRepository : ILikesRepository
{
    private readonly DataContext _context;

    public LikesRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<Like> GetLikeAsync(int sourceUserId, int targetGameId)
    {
        return await _context.Likes.FindAsync(sourceUserId, targetGameId);
    }

    public async Task<AppUser> GetUserWithLikesAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.LikedGames)
            .AsSplitQuery()
            .FirstOrDefaultAsync(u => u.Id == userId);
    }
}
