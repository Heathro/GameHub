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
        PaginationParams paginationParams, GameFilterDto gameFilterDto)
    {
        var query = _context.Games
            .Include(p => p.Platforms)
            .Include(g => g.Genres)
            .AsQueryable();

        if (gameFilterDto.Platforms.Windows || 
            gameFilterDto.Platforms.Macos || 
            gameFilterDto.Platforms.Linux)
        {
            query = query.Where(g => 
                (gameFilterDto.Platforms.Windows && g.Platforms.Windows) ||
                (gameFilterDto.Platforms.Macos && g.Platforms.Macos) ||
                (gameFilterDto.Platforms.Linux && g.Platforms.Linux)
            );
        }

        if (gameFilterDto.Genres.Action || gameFilterDto.Genres.Adventure || 
            gameFilterDto.Genres.Card || gameFilterDto.Genres.Educational || 
            gameFilterDto.Genres.Fighting || gameFilterDto.Genres.Horror ||
            gameFilterDto.Genres.Platformer || gameFilterDto.Genres.Puzzle ||
            gameFilterDto.Genres.Racing || gameFilterDto.Genres.Rhythm ||
            gameFilterDto.Genres.Roleplay || gameFilterDto.Genres.Shooter ||
            gameFilterDto.Genres.Simulation || gameFilterDto.Genres.Sport ||
            gameFilterDto.Genres.Stealth || gameFilterDto.Genres.Strategy ||
            gameFilterDto.Genres.Survival)
        {
            query = query.Where(g =>
                (gameFilterDto.Genres.Action && g.Genres.Action) ||
                (gameFilterDto.Genres.Adventure && g.Genres.Adventure) ||
                (gameFilterDto.Genres.Card && g.Genres.Card) ||
                (gameFilterDto.Genres.Educational && g.Genres.Educational) ||
                (gameFilterDto.Genres.Fighting && g.Genres.Fighting) ||
                (gameFilterDto.Genres.Horror && g.Genres.Horror) ||
                (gameFilterDto.Genres.Platformer && g.Genres.Platformer) ||
                (gameFilterDto.Genres.Puzzle && g.Genres.Puzzle) ||
                (gameFilterDto.Genres.Racing && g.Genres.Racing) ||
                (gameFilterDto.Genres.Rhythm && g.Genres.Rhythm) ||
                (gameFilterDto.Genres.Roleplay && g.Genres.Roleplay) ||
                (gameFilterDto.Genres.Shooter && g.Genres.Shooter) ||
                (gameFilterDto.Genres.Simulation && g.Genres.Simulation) ||
                (gameFilterDto.Genres.Sport && g.Genres.Sport) ||
                (gameFilterDto.Genres.Stealth && g.Genres.Stealth) ||
                (gameFilterDto.Genres.Strategy && g.Genres.Strategy) ||
                (gameFilterDto.Genres.Survival && g.Genres.Survival)
            );
        }

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

    public async Task<bool> TitleExists(int id, string title)
    {
        return await _context.Games
            .AnyAsync(game => game.Id != id && game.Title.ToLower() == title.ToLower());
    }
}
