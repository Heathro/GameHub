using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Interfaces;
using API.DTOs;
using API.Data;

namespace API.Controllers;

[Authorize]

public class GamesController : BaseApiController
{
    private readonly IGamesRepository _gamesRepository;
    private readonly IMapper _mapper;

    public GamesController(IGamesRepository gamesRepository, IMapper mapper, IImageService imageService)
    {
        _gamesRepository = gamesRepository;
        _mapper = mapper;
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
}
