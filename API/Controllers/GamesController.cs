using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Interfaces;
using API.DTOs;
using API.Data;
using API.Entities;
using API.Extensions;

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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetGames()
    {
        return Ok(await _gamesRepository.GetGamesAsync());
    }

    [HttpGet("{title}")]
    public async Task<ActionResult<GameDto>> GetGame(string title)
    {
        return await _gamesRepository.GetGameAsync(title);
    }

    [HttpPut("{title}/edit-game")]
    public async Task<ActionResult> UpdateGame(string title, [FromBody]GameEditDto gameEditDto)
    {
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        if (game == null) return NotFound();

        _mapper.Map(gameEditDto, game);

        if (await _gamesRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to update game");
    }

    [HttpPut("{title}/update-poster")]
    public async Task<ActionResult<PosterDto>> UpdatePoster([FromRoute]string title, IFormFile file)
    {
        var game = await _gamesRepository.GetGameByTitleAsync(title);

        if (game == null) return NotFound();

        var result = await _imageService.AddImageAsync(file);

        if (result.Error != null) return BadRequest(result.Error.Message);

        game.Poster.Url = result.SecureUrl.AbsoluteUri;
        game.Poster.PublicId = result.PublicId;

        if (await _gamesRepository.SaveAllAsync()) return _mapper.Map<PosterDto>(game.Poster);

        return BadRequest("Failed to update poster");
    }

    [HttpPost("{title}/add-screenshot")]
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
                new { title = game.Title},
                _mapper.Map<ScreenshotDto>(screenshot)
            );
        }

        return BadRequest("Failed to add screenshot");
    }
}
