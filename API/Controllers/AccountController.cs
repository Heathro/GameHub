using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    private readonly DataContext _context;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AccountController(DataContext context, ITokenService tokenService, IMapper mapper)
    {
        _context = context;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.UserName)) return BadRequest("Username is already taken");
        
        var user = _mapper.Map<AppUser>(registerDto);

        using var hmac = new HMACSHA512();

        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
        user.PasswordSalt = hmac.Key;
        user.Avatar = new Avatar();
        user.Realname = "";
        user.Summary = "";
        user.Country = "";
        user.City = "";

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Token = _tokenService.CreateToken(user),
            AvatarUrl = user.Avatar.Url
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _context.Users
            .Include(a => a.Avatar)
            .SingleOrDefaultAsync(user => user.UserName == loginDto.UserName);
            
        if (user == null) return Unauthorized("Invalid username");

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        for (int i = 0; i < computedHash.Length; i++)
            if (computedHash[i] != user.PasswordHash[i]) 
                return Unauthorized("Invalid password");

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Token = _tokenService.CreateToken(user),
            AvatarUrl = user.Avatar.Url
        };
    }

    private async Task<bool> UserExists(string username)
    {
        return await _context.Users.AnyAsync(user => user.UserName.ToLower() == username.ToLower());
    }
}
