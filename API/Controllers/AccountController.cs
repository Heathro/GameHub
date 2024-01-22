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
    private readonly INotificationCenter _notificationCenter;

    public AccountController(UserManager<AppUser> userManager, ITokenService tokenService,
        IMapper mapper, INotificationCenter notificationCenter)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _mapper = mapper;
        _notificationCenter = notificationCenter;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await _userManager.Users.AnyAsync(u => u.NormalizedUserName == registerDto.UserName.ToUpper()))
        {
            return BadRequest("Username is already taken");
        }
        
        var user = _mapper.Map<AppUser>(registerDto);

        user.Avatar = new Avatar();
        user.Realname = "";
        user.Summary = "";
        user.Country = "";
        user.City = "";

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        var roleResult = await _userManager.AddToRoleAsync(user, "Player");
        if (!roleResult.Succeeded) return BadRequest(result.Errors);

        _notificationCenter.UserRegisted(_mapper.Map<PlayerDto>(user));

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Token = await _tokenService.CreateTokenAsync(user),
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
            Token = await _tokenService.CreateTokenAsync(user),
            AvatarUrl = user.Avatar.Url
        };
    }
}
