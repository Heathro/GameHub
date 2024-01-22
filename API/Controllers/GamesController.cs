using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Interfaces;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;

namespace API.Controllers;

[Authorize]
public class GamesController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;
    private readonly INotificationCenter _notificationCenter;

    public GamesController(IUnitOfWork unitOfWork, IMapper mapper, IImageService imageService,
        INotificationCenter notificationCenter)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _imageService = imageService;
        _notificationCenter = notificationCenter;
    }

    [HttpPost("list")]
    public async Task<ActionResult<PagedList<GameDto>>> GetGames(
        [FromQuery]PaginationParams paginationParams, [FromBody]GameFilterDto gameFilterDto)
    {
        var games = await _unitOfWork.GamesRepository
            .GetGamesAsync(paginationParams, gameFilterDto, User.GetUserId());

        Response.AddPaginationHeader(new PaginationHeader(
            games.CurrentPage,
            games.ItemsPerPage,
            games.TotalItems,
            games.TotalPages
        ));

        return Ok(games);
    }

    [HttpGet("{title}")]
    public async Task<ActionResult<GameDto>> GetGame(string title)
    {
        return await _unitOfWork.GamesRepository.GetGameAsync(title);
    }

    [HttpPut("update-game/{title}")]
    public async Task<ActionResult> UpdateGame(string title, [FromBody]GameEditDto gameEditDto)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        if (game.Publication.PublisherId != User.GetUserId())
        {
            return BadRequest("This is not your game");
        }

        if (await _unitOfWork.GamesRepository.TitleExistsAsync(gameEditDto.Title, gameEditDto.Id))
        {
            return BadRequest("Title is already taken");
        }
        
        var updatedGame = _mapper.Map(gameEditDto, game);

        if (await _unitOfWork.Complete())
        {
            var updatedGameDto = _mapper.Map<GameDto>(updatedGame);
            _notificationCenter.GameUpdated(User.GetUsername(), updatedGameDto);

            return NoContent();
        }

        return BadRequest("No changes were detected");
    }

    [HttpPut("update-poster/{title}")]
    public async Task<ActionResult<PosterDto>> UpdatePoster([FromRoute]string title, IFormFile file)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();
        
        if (game.Publication.PublisherId != User.GetUserId())
        {
            return BadRequest("This is not your game");
        }

        var result = await _imageService.AddImageAsync(file);
        if (result.Error != null) return BadRequest(result.Error.Message);

        var oldPublicId = game.Poster.PublicId;

        game.Poster.Url = result.SecureUrl.AbsoluteUri;
        game.Poster.PublicId = result.PublicId;
        
        if (oldPublicId != null)
        {
            var deletingResult = await _imageService.DeleteImageAsync(oldPublicId);
            if (deletingResult.Error != null) return BadRequest(deletingResult.Error.Message);
        }

        if (await _unitOfWork.Complete())
        {
            var updatedPoster = _mapper.Map<PosterDto>(game.Poster);
            _notificationCenter.PosterUpdated(User.GetUsername(), game.Id, updatedPoster);

            return updatedPoster;
        }

        return BadRequest("Failed to update poster");
    }

    [HttpPost("add-screenshot/{title}")]
    public async Task<ActionResult<ScreenshotDto>> AddScreenshot([FromRoute]string title, IFormFile file)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        if (game.Publication.PublisherId != User.GetUserId())
        {
            return BadRequest("This is not your game");
        }

        var result = await _imageService.AddImageAsync(file);
        if (result.Error != null) return BadRequest(result.Error.Message);

        var screenshot = new Screenshot
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId
        };

        game.Screenshots.Add(screenshot);

        if (await _unitOfWork.Complete())
        {
            var newScreenshot = _mapper.Map<ScreenshotDto>(screenshot);
            _notificationCenter.ScreenshotAdded(User.GetUsername(), game.Id, newScreenshot);

            return CreatedAtAction
            (
                nameof(GetGame),
                new { title = game.Title },
                newScreenshot
            );
        }

        return BadRequest("Failed to add screenshot");
    }

    [HttpDelete("delete-screenshot/{title}/{screenshotId}")]
    public async Task<ActionResult> DeleteScreenshot(string title, int screenshotId)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        if (game.Publication.PublisherId != User.GetUserId())
        {
            return BadRequest("This is not your game");
        }

        var screenshot = game.Screenshots.FirstOrDefault(s => s.Id == screenshotId);
        if (screenshot == null) return NotFound();

        if (screenshot.PublicId != null)
        {
            var result = await _imageService.DeleteImageAsync(screenshot.PublicId);
            if (result.Error != null) return BadRequest(result.Error.Message);
        }

        game.Screenshots.Remove(screenshot);

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.ScreenshotDeleted(User.GetUsername(), game.Id, screenshotId);
            
            return Ok();
        }

        return BadRequest("Failed to delete screenshot");
    }

    [HttpDelete("delete-game/{title}")]
    public async Task<ActionResult> DeleteGame(string title)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        if (game.Publication.PublisherId != User.GetUserId())
        {
            return BadRequest("This is not your game");
        }

        var posterPublicId = game.Poster.PublicId;
        if (posterPublicId != null)
        {
            var deletingResult = await _imageService.DeleteImageAsync(posterPublicId);
            if (deletingResult.Error != null) return BadRequest(deletingResult.Error.Message);
            game.Poster.Url = "";
            game.Poster.PublicId = null;
        }

        foreach (var screenshot in game.Screenshots)
        {
            if (screenshot.PublicId != null)
            {
                var result = await _imageService.DeleteImageAsync(screenshot.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }
        }
        game.Screenshots.Clear();

        _unitOfWork.GamesRepository.DeleteGame(game);

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.GameDeleted(User.GetUsername(), game.Id);

            return Ok();
        }

        return BadRequest("Failed to delete game");
    }
}
