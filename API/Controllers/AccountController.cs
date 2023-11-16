using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.UserName)) return BadRequest("Username is already taken");
        
        var user = _mapper.Map<AppUser>(registerDto);

        user.Avatar = new Avatar();
        user.Realname = "";
        user.Summary = "";
        user.Country = "";
        user.City = "";
        user.Created = DateTime.UtcNow;

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        var roleResult = await _userManager.AddToRoleAsync(user, "Player");
        if (!roleResult.Succeeded) return BadRequest(result.Errors);

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Token = await _tokenService.CreateToken(user),
            AvatarUrl = user.Avatar.Url
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.Users
            .Include(a => a.Avatar)
            .SingleOrDefaultAsync(user => user.UserName == loginDto.UserName);
            
        if (user == null) return Unauthorized("Invalid username");

        var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!result) return Unauthorized("Invalid password");

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Token = await _tokenService.CreateToken(user),
            AvatarUrl = user.Avatar.Url
        };
    }

    private async Task<bool> UserExists(string username)
    {
        return await _userManager.Users.AnyAsync(u => u.NormalizedUserName == username.ToUpper());
    }
}
