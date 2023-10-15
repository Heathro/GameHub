using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Interfaces;
using API.DTOs;

namespace API.Controllers;

[Authorize]
public class GamesController : BaseApiController
{
    private readonly IGamesRepository _gamesRepository;
    private readonly IMapper _mapper;

    public GamesController(IGamesRepository gamesRepository, IMapper mapper)
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
}
