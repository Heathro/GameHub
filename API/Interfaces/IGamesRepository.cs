using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IGamesRepository
{
    Task<TitleDto> GetTitleAsync(string title);
    Task<IEnumerable<TitleDto>> GetTitlesAsync();
    Task<Game> GetGameByIdAsync(int id);
    Task<Game> GetGameByTitleAsync(string title);
    Task<IEnumerable<Game>> GetGamesAsync();
    void Update(Game game);
    Task<bool> SaveAllAsync();
}
