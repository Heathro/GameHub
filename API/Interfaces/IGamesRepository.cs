using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IGamesRepository
{
    Task<GameDto> GetGameAsync(string title);
    Task<PagedList<GameDto>> GetGamesAsync(PaginationParams paginationParams, GameFilterDto gameFilterDto);
    Task<Game> GetGameByIdAsync(int id);
    Task<Game> GetGameByTitleAsync(string title);
    Task<IEnumerable<Game>> GetAllGamesAsync();
    void Update(Game game);
    Task<bool> SaveAllAsync();
    Task<bool> TitleExists(int id, string title);
}
