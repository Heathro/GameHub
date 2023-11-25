using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.DTOs;
using API.Interfaces;
using API.Extensions;
using API.Helpers;

namespace API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUsersRepository _usersRepository;
    private readonly IImageService _imageService;
    private readonly IMapper _mapper;

    public UsersController(IUsersRepository usersRepository, IImageService imageService, IMapper mapper)
    {
        _usersRepository = usersRepository;
        _imageService = imageService;
        _mapper = mapper;
    }    

    [HttpGet("list")]
    public async Task<ActionResult<PagedList<PlayerDto>>> GetPlayersAsync(
        [FromQuery]PaginationParams paginationParams)
    {
        var players = await _usersRepository.GetPlayersAsync(paginationParams, User.GetUserId());

        Response.AddPaginationHeader(new PaginationHeader(
            players.CurrentPage,
            players.ItemsPerPage,
            players.TotalItems,
            players.TotalPages
        ));

        return Ok(players);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<PlayerDto>> GetPlayerAsync(string username)
    {
        var player = await _usersRepository.GetPlayerAsync(User.GetUserId(), username);

        return Ok(player);
    }

    [HttpPut("edit-profile")]
    public async Task<ActionResult> UpdateUser(PlayerEditDto playerEditDto)
    {
        var user = await _usersRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return NotFound();

        _mapper.Map(playerEditDto, user);

        if (await _usersRepository.SaveAllAsync()) return NoContent();

        return BadRequest("No changes were detected");
    }

    [HttpPut("update-avatar")]
    public async Task<ActionResult<AvatarDto>> UpdateAvatar(IFormFile file)
    {
        var user = await _usersRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return NotFound();

        var result = await _imageService.AddImageAsync(file);

        if (result.Error != null) return BadRequest(result.Error.Message);

        var oldPublicId = user.Avatar.PublicId;

        user.Avatar.Url = result.SecureUrl.AbsoluteUri;
        user.Avatar.PublicId = result.PublicId;
        
        if (oldPublicId != null)
        {
            var deletingResult = await _imageService.DeleteImageAsync(oldPublicId);
            if (deletingResult.Error != null) return BadRequest(deletingResult.Error.Message);
        }

        if (await _usersRepository.SaveAllAsync()) return _mapper.Map<AvatarDto>(user.Avatar);

        return BadRequest("Failed to update photo");
    }

    [HttpDelete("delete-user")]
    public async Task<ActionResult> DeleteUser()
    {
        await _usersRepository.DeleteUserAsync(User.GetUsername());

        if (await _usersRepository.SaveAllAsync()) return BadRequest("Failed to delete user");
        
        return Ok();
    }
}
