using Microsoft.AspNetCore.Mvc;
using API.Interfaces;
using API.Extensions;
using API.Entities;

namespace API.Controllers;

public class BookmarksController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;

    public BookmarksController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpPost("{gameId}")]
    public async Task<ActionResult> BookmarkGame(int gameId)
    {
        var sourceUserId = User.GetUserId();
        var sourceUser = await _unitOfWork.BookmarksRepository.GetUserWithBookmarksAsync(sourceUserId);

        var targetGame = await _unitOfWork.GamesRepository.GetGameByIdAsync(gameId);        
        if (targetGame == null) return NotFound();

        var bookmark = await _unitOfWork.BookmarksRepository.GetBookmarkAsync(sourceUserId, targetGame.Id);
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
        
        if (await _unitOfWork.Complete()) return Ok();

        return BadRequest("Failed to like game");
    }
}
