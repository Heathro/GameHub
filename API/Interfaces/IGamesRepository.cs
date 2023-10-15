using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IGamesRepository
{
    Task<GameDto> GetGameAsync(string title);
    Task<IEnumerable<GameDto>> GetGamesAsync();
    Task<Game> GetGameByIdAsync(int id);
    Task<Game> GetGameByTitleAsync(string title);
    Task<IEnumerable<Game>> GetAllGamesAsync();
    void Update(Game game);
    Task<bool> SaveAllAsync();
}
