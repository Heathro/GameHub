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
    private readonly IMapper _mapper;

    public LikesRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
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

    public async Task<IEnumerable<LikedUserDto>> GetLikedUsers(int gameId)
    {
        var likes = _context.Likes.Where(l => l.TargetGameId == gameId);
        var users = likes.Select(l => l.SourceUser);

        return await users.Select(u => new LikedUserDto
        {
            Id = u.Id,
            Username = u.Username,
            Avatar = _mapper.Map<AvatarDto>(u.Avatar),
            LastActive = u.LastActive
        })
        .ToListAsync();
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
