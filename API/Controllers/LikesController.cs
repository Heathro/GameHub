using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class LikesController : BaseApiController
{
    private readonly ILikesRepository _likesRepository;
    private readonly IGamesRepository _gamesRepository;

    public LikesController(ILikesRepository likesRepository, IGamesRepository gamesRepository)
    {
        _likesRepository = likesRepository;
        _gamesRepository = gamesRepository;
    }

    [HttpPost("{gameId}")]
    public async Task<ActionResult<int>> LikeGame(int gameId)
    {
        var sourceUserId = User.GetUserId();
        var sourceUser = await _likesRepository.GetUserWithLikes(sourceUserId);

        var targetGame = await _gamesRepository.GetGameByIdAsync(gameId);        
        if (targetGame == null) return NotFound();

        var like = await _likesRepository.GetLike(sourceUserId, targetGame.Id);
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
        }
        
        if (await _likesRepository.SaveAllAsync()) return Ok(targetGame.Id);

        return BadRequest("Failed to like game");
    }

    [HttpGet("games")]
    public async Task<ActionResult<IEnumerable<int>>> GetLikedGames()
    {
        var games = await _likesRepository.GetLikedGames(User.GetUserId());
        return Ok(games);
    }

    [HttpGet("users/{gameId}")]
    public async Task<ActionResult<IEnumerable<int>>> GetLikedUsers(int gameId)
    {
        var users = await _likesRepository.GetLikedUsers(gameId);
        return Ok(users);
    }
}
