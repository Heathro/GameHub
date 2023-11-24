using API.Entities;

namespace API.Interfaces;

public interface ILikesRepository
{
    Task<Like> GetLikeAsync(int sourceUserId, int targetGameId);
    Task<AppUser> GetUserWithLikesAsync(int userId);
    Task<bool> SaveAllAsync();
}
