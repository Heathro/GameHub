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
    private readonly IGamesRepository _gamesRepository;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;

    public GamesController(IGamesRepository gamesRepository, IMapper mapper, IImageService imageService)
    {
        _gamesRepository = gamesRepository;
        _mapper = mapper;
        _imageService = imageService;
    }

    [HttpPost("list")]
    public async Task<ActionResult<PagedList<GameDto>>> GetGames(
        [FromQuery]PaginationParams paginationParams, [FromBody]GameFilterDto gameFilterDto)
    {
        var games = await _gamesRepository.GetGamesAsync(paginationParams, gameFilterDto);

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
        return await _gamesRepository.GetGameAsync(title);
    }

    [HttpPut("update-game/{title}")]
    public async Task<ActionResult> UpdateGame(string title, [FromBody]GameEditDto gameEditDto)
    {
        if (await _gamesRepository.TitleExistsAsync(gameEditDto))
        {
            return BadRequest("Title is already taken");
        }
        
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        if (game == null) return NotFound();

        _mapper.Map(gameEditDto, game);

        if (await _gamesRepository.SaveAllAsync()) return NoContent();

        return BadRequest("No changes were detected");
    }

    [HttpPut("update-poster/{title}")]
    public async Task<ActionResult<PosterDto>> UpdatePoster([FromRoute]string title, IFormFile file)
    {
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        if (game == null) return NotFound();

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

        if (await _gamesRepository.SaveAllAsync()) return _mapper.Map<PosterDto>(game.Poster);

        return BadRequest("Failed to update poster");
    }

    [HttpPost("add-screenshot/{title}")]
    public async Task<ActionResult<ScreenshotDto>> AddScreenshot([FromRoute]string title, IFormFile file)
    {
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        if (game == null) return NotFound();

        var result = await _imageService.AddImageAsync(file);

        if (result.Error != null) return BadRequest(result.Error.Message);

        var screenshot = new Screenshot
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId
        };

        game.Screenshots.Add(screenshot);

        if (await _gamesRepository.SaveAllAsync())
        {
            return CreatedAtAction
            (
                nameof(GetGame),
                new { title = game.Title },
                _mapper.Map<ScreenshotDto>(screenshot)
            );
        }

        return BadRequest("Failed to add screenshot");
    }

    [HttpDelete("delete-screenshot/{title}/{screenshotId}")]
    public async Task<ActionResult> DeleteScreenshot(string title, int screenshotId)
    {
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        if (game == null) return NotFound();

        var screenshot = game.Screenshots.FirstOrDefault(s => s.Id == screenshotId);

        if (screenshot == null) return NotFound();

        if (screenshot.PublicId != null)
        {
            var result = await _imageService.DeleteImageAsync(screenshot.PublicId);
            if (result.Error != null) return BadRequest(result.Error.Message);
        }

        game.Screenshots.Remove(screenshot);

        if (await _gamesRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to delete screenshot");
    }

    [HttpDelete("delete-game/{title}")]
    public async Task<ActionResult> DeleteGame(string title)
    {
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        _gamesRepository.DeleteGame(game);

        if (await _gamesRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to delete game");
    }
}
