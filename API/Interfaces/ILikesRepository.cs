using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface ILikesRepository
{
    Task<Like> GetLike(int sourceUserId, int targetGameId);
    Task<IEnumerable<int>> GetLikedGames(int userId);
    Task<IEnumerable<LikedUserDto>> GetLikedUsers(int gameId);
    Task<AppUser> GetUserWithLikes(int userId);
    Task<bool> SaveAllAsync();
}
