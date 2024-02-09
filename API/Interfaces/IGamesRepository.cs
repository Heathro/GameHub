using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IGamesRepository
{
    Task<GameDto> GetGameAsync(string title);
    Task<PagedList<GameDto>> GetGamesAsync(
        PaginationParams paginationParams, GameFilterDto gameFilterDto, int currentUserId);
    Task<PagedList<GameDto>> GetGamesForModerationAsync(PaginationParams paginationParams);
    Task<Game> GetGameByIdAsync(int id);
    Task<Game> GetGameByTitleAsync(string title);
    Task<List<Game>> GetGamesForUserAsync(int userId);
    long GetTotalFilesSize();
    Task<bool> TitleExistsAsync(string title, int id = 0);
    void DeleteGame(Game game);
}
