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

    public UsersController(IUsersRepository usersRepository, IMapper mapper)
    {
        _usersRepository = usersRepository;
        _mapper = mapper;
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
}
