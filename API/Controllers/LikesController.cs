using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API.Entities;
using API.Extensions;
using API.Interfaces;

namespace API.Controllers;

[Authorize]
public class LikesController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationCenter _notificationCenter;

    public LikesController(IUnitOfWork unitOfWork, INotificationCenter notificationCenter)
    {
        _unitOfWork = unitOfWork;
        _notificationCenter = notificationCenter;
    }

    [HttpPost("{gameId}")]
    public async Task<ActionResult> LikeGame(int gameId)
    {
        var sourceUserId = User.GetUserId();
        var sourceUser = await _unitOfWork.LikesRepository.GetUserWithLikesAsync(sourceUserId);

        var targetGame = await _unitOfWork.GamesRepository.GetGameByIdAsync(gameId);        
        if (targetGame == null) return NotFound();

        bool isLiked = false;

        var like = await _unitOfWork.LikesRepository.GetLikeAsync(sourceUserId, targetGame.Id);
        if (like != null)
        {
            sourceUser.LikedGames.Remove(like);
        }
        else
        {
            like = new Like
            {
                SourceUserId = sourceUserId,
                TargetGameId = targetGame.Id
            };
            sourceUser.LikedGames.Add(like);
            isLiked = true;
        }
        
        if (await _unitOfWork.Complete())
        {
            if (isLiked)
            {
                _notificationCenter.GameLiked(User.GetUsername(), gameId, sourceUserId);
            }
            else
            {
                _notificationCenter.GameUnliked(User.GetUsername(), gameId, sourceUserId);
            }

            return Ok();
        }

        return BadRequest("Failed to like game");
    }
}
