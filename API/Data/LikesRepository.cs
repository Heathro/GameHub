using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.DTOs;
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

    public async Task<Like> GetLike(int sourceUserId, int targetGameId)
    {
        return await _context.Likes.FindAsync(sourceUserId, targetGameId);
    }

    public async Task<IEnumerable<int>> GetLikedGames(int userId)
    {
        var likes = _context.Likes.Where(l => l.SourceUserId == userId);
        var games = likes.Select(l => l.TargetGame);
        return await games.Select(g => g.Id).ToListAsync();
    }

    public async Task<IEnumerable<int>> GetLikedUsers(int gameId)
    {
        var likes = _context.Likes.Where(l => l.TargetGameId == gameId);
        var users = likes.Select(l => l.SourceUser);
        return await users.Select(u => u.Id).ToListAsync();
    }

    public async Task<AppUser> GetUserWithLikes(int userId)
    {
        return await _context.Users
            .Include(u => u.LikedGames)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
