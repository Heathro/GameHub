using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.DTOs;

namespace API.Data;

public class GamesRepository : IGamesRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public GamesRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GameDto> GetGameAsync(string title)
    {
        return await _context.Games
            .Where(g => g.Title == title)
            .ProjectTo<GameDto>(_mapper.ConfigurationProvider)
            .SingleOrDefaultAsync();
    }

    public async Task<IEnumerable<GameDto>> GetGamesAsync()
    {
        return await _context.Games
            .ProjectTo<GameDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<Game> GetGameByIdAsync(int id)
    {
        return await _context.Games
            .Include(p => p.Platforms)
            .Include(g => g.Genres)
            .Include(p => p.Poster)
            .Include(s => s.Screenshots)
            .SingleOrDefaultAsync(game => game.Id == id);
    }

    public async Task<Game> GetGameByTitleAsync(string title)
    {
        return await _context.Games
            .Include(p => p.Platforms)
            .Include(g => g.Genres)
            .Include(s => s.Poster)
            .Include(s => s.Screenshots)
            .SingleOrDefaultAsync(game => game.Title == title);
    }

    public async Task<IEnumerable<Game>> GetAllGamesAsync()
    {
        return await _context.Games
            .Include(p => p.Platforms)
            .Include(g => g.Genres)
            .Include(s => s.Poster)
            .Include(s => s.Screenshots)
            .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public void Update(Game game)
    {
        _context.Entry(game).State = EntityState.Modified;
    }
}
