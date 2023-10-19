
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.DTOs;
using API.Interfaces;

namespace API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUsersRepository _usersRepository;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;

    public UsersController(IUsersRepository usersRepository, IMapper mapper, IImageService imageService)
    {
        _usersRepository = usersRepository;
        _mapper = mapper;
        _imageService = imageService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetUsers()
    {
        return Ok(await _usersRepository.GetPlayersAsync());
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<PlayerDto>> GetUser(string username)
    {
        return await _usersRepository.GetPlayerAsync(username);
    }

    [HttpPut("edit-profile")]
    public async Task<ActionResult> UpdateUser(PlayerEditDto playerEditDto)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _usersRepository.GetUserByUsernameAsync(username);

        if (user == null) return NotFound();

        _mapper.Map(playerEditDto, user);

        if (await _usersRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to update user");
    }
}
