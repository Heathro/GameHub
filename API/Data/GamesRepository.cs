using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.DTOs;
using API.Helpers;

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

    public async Task<PagedList<GameDto>> GetGamesAsync(
        PaginationParams paginationParams, GameFilterDto gameFilter)
    {
        var query = _context.Games
            .Include(p => p.Platforms)
            .Include(g => g.Genres)
            .Include(l => l.LikedUsers)
            .AsQueryable();

        if (gameFilter.Platforms.Windows || 
            gameFilter.Platforms.Macos || 
            gameFilter.Platforms.Linux)
        {
            query = query.Where(g => 
                (gameFilter.Platforms.Windows && g.Platforms.Windows) ||
                (gameFilter.Platforms.Macos   && g.Platforms.Macos)   ||
                (gameFilter.Platforms.Linux   && g.Platforms.Linux)
            );
        }

        if (gameFilter.Genres.Action     || gameFilter.Genres.Adventure   || 
            gameFilter.Genres.Card       || gameFilter.Genres.Educational || 
            gameFilter.Genres.Fighting   || gameFilter.Genres.Horror      ||
            gameFilter.Genres.Platformer || gameFilter.Genres.Puzzle      ||
            gameFilter.Genres.Racing     || gameFilter.Genres.Rhythm      ||
            gameFilter.Genres.Roleplay   || gameFilter.Genres.Shooter     ||
            gameFilter.Genres.Simulation || gameFilter.Genres.Sport       ||
            gameFilter.Genres.Stealth    || gameFilter.Genres.Strategy    ||
            gameFilter.Genres.Survival)
        {
            query = query.Where(g =>
                (gameFilter.Genres.Action      && g.Genres.Action)      ||
                (gameFilter.Genres.Adventure   && g.Genres.Adventure)   ||
                (gameFilter.Genres.Card        && g.Genres.Card)        ||
                (gameFilter.Genres.Educational && g.Genres.Educational) ||
                (gameFilter.Genres.Fighting    && g.Genres.Fighting)    ||
                (gameFilter.Genres.Horror      && g.Genres.Horror)      ||
                (gameFilter.Genres.Platformer  && g.Genres.Platformer)  ||
                (gameFilter.Genres.Puzzle      && g.Genres.Puzzle)      ||
                (gameFilter.Genres.Racing      && g.Genres.Racing)      ||
                (gameFilter.Genres.Rhythm      && g.Genres.Rhythm)      ||
                (gameFilter.Genres.Roleplay    && g.Genres.Roleplay)    ||
                (gameFilter.Genres.Shooter     && g.Genres.Shooter)     ||
                (gameFilter.Genres.Simulation  && g.Genres.Simulation)  ||
                (gameFilter.Genres.Sport       && g.Genres.Sport)       ||
                (gameFilter.Genres.Stealth     && g.Genres.Stealth)     ||
                (gameFilter.Genres.Strategy    && g.Genres.Strategy)    ||
                (gameFilter.Genres.Survival    && g.Genres.Survival)
            );
        }

        query = paginationParams.OrderBy switch
        {
            "za" => query.OrderByDescending(g => g.Title),
            _ => query.OrderBy(g => g.Title)
        };

        return await PagedList<GameDto>.CreateAsync
        (
            query.AsNoTracking().ProjectTo<GameDto>(_mapper.ConfigurationProvider),
            paginationParams.CurrentPage,
            paginationParams.ItemsPerPage
        );
    }

    public async Task<Game> GetGameByIdAsync(int id)
    {
        return await _context.Games
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

    public async Task<bool> TitleExists(GameEditDto gameEditDto)
    {
        return await _context.Games
            .AnyAsync(
                game => game.Id != gameEditDto.Id && 
                game.Title.ToLower() == gameEditDto.Title.ToLower()
            );
    }
}
