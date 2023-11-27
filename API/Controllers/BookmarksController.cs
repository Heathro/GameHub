using Microsoft.AspNetCore.Mvc;
using API.Interfaces;
using API.Extensions;
using API.Entities;

namespace API.Controllers;

public class BookmarksController : BaseApiController
{
    private readonly IBookmarksRepository _bookmarksRepository;
    private readonly IGamesRepository _gamesRepository;

    public BookmarksController(IBookmarksRepository bookmarksRepository, IGamesRepository gamesRepository)
    {
        _bookmarksRepository = bookmarksRepository;
        _gamesRepository = gamesRepository;
    }

    [HttpPost("{gameId}")]
    public async Task<ActionResult> BookmarkGame(int gameId)
    {
        var sourceUserId = User.GetUserId();
        var sourceUser = await _bookmarksRepository.GetUserWithBookmarksAsync(sourceUserId);

        var targetGame = await _gamesRepository.GetGameByIdAsync(gameId);        
        if (targetGame == null) return NotFound();

        var bookmark = await _bookmarksRepository.GetBookmarkAsync(sourceUserId, targetGame.Id);
        if (bookmark != null)
        {
            sourceUser.Bookmarks.Remove(bookmark);
        }
        else
        {
            bookmark = new Bookmark
            {
                SourceUserId = sourceUserId,
                TargetGameId = targetGame.Id
            };
            sourceUser.Bookmarks.Add(bookmark);
        }
        
        if (await _bookmarksRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to like game");
    }
}
