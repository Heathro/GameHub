using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.Interfaces;

namespace API.Data;

public class BookmarksRepository : IBookmarksRepository
{
    private readonly DataContext _context;

    public BookmarksRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<Bookmark> GetBookmarkAsync(int sourceUserId, int targetGameId)
    {
        return await _context.Bookmarks.FindAsync(sourceUserId, targetGameId);
    }

    public async Task<AppUser> GetUserWithBookmarksAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Bookmarks)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
