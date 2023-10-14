using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API.Interfaces;
using API.DTOs;
using AutoMapper;

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
    public async Task<ActionResult<IEnumerable<TitleDto>>> GetGames()
    {
        return Ok(await _gamesRepository.GetTitlesAsync());
    }

    [HttpGet("{title}")]
    public async Task<ActionResult<TitleDto>> GetGame(string title)
    {
        return await _gamesRepository.GetTitleAsync(title);
    }
}
