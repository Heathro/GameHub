using API.Entities;

namespace API.Interfaces;

public interface ILikesRepository
{
    Task<Like> GetLikeAsync(int sourceUserId, int targetGameId);
    Task<IEnumerable<int>> GetLikedGamesAsync(int userId);
    Task<IEnumerable<int>> GetLikedUsersAsync(int gameId);
    Task<AppUser> GetUserWithLikesAsync(int userId);
    Task<bool> SaveAllAsync();
}
