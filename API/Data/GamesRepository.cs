using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.Helpers;
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

    public async Task<PagedList<GameDto>> GetGamesAsync(
        PaginationParams paginationParams, GameFilterDto gameFilter, int currentUserId)
    {
        var query = _context.Games
            .Include(g => g.Platforms)
            .Include(g => g.Genres)
            .Include(g => g.LikedUsers)
            .Include(g => g.Publication)
            .AsQueryable();

        query = paginationParams.Relationship switch
        {
            "published" => query.Where(g => g.Publication.Publisher.Id == currentUserId),
            "bookmarked" => query
                .Where(g => g.Bookmarks.Select(b => b.SourceUserId).Contains(currentUserId)),
            "liked" => query
                .Where(g => g.LikedUsers.Select(b => b.SourceUserId).Contains(currentUserId)),
            _ => query
        };

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
            .Include(g => g.Platforms)
            .Include(g => g.Genres)
            .Include(g => g.Poster)
            .Include(g => g.Screenshots)
            .SingleOrDefaultAsync(game => game.Title == title);
    }

    public async Task<bool> TitleExistsAsync(string title, int id = 0)
    {
        return await _context.Games.AnyAsync(g => g.Id != id && g.Title.ToLower() == title.ToLower());
    }

    public void DeleteGame(Game game)
    {
        _context.Games.Remove(game);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
