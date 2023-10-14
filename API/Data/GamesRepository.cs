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

    public async Task<TitleDto> GetTitleAsync(string title)
    {
        return await _context.Games
            .Where(g => g.Title == title)
            .ProjectTo<TitleDto>(_mapper.ConfigurationProvider)
            .SingleOrDefaultAsync();
    }

    public async Task<IEnumerable<TitleDto>> GetTitlesAsync()
    {
        return await _context.Games
            .ProjectTo<TitleDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<Game> GetGameByIdAsync(int id)
    {
        return await _context.Games.FindAsync(id);
    }

    public async Task<Game> GetGameByTitleAsync(string title)
    {
        return await _context.Games
            .Include(s => s.Screenshots)
            .SingleOrDefaultAsync(game => game.Title == title);
    }

    public async Task<IEnumerable<Game>> GetGamesAsync()
    {
        return await _context.Games
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
