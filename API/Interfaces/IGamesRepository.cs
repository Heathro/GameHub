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
    Task<bool> TitleExistsAsync(string title, int id = 0);
    void DeleteGame(Game game);
    Task<bool> SaveAllAsync();
}
