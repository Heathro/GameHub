using API.Entities;

namespace API.Interfaces;

public interface IBookmarksRepository
{
    Task<Bookmark> GetBookmarkAsync(int sourceUserId, int targetGameId);
    Task<AppUser> GetUserWithBookmarksAsync(int userId);
}
