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
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;

    public UsersController(IUsersRepository usersRepository, IMapper mapper, IImageService imageService)
    {
        _usersRepository = usersRepository;
        _mapper = mapper;
        _imageService = imageService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<PlayerDto>>> GetUsers(
        [FromQuery]PaginationParams paginationParams)
    {
        var users = await _usersRepository.GetPlayersAsync(paginationParams, User.GetUsername());

        Response.AddPaginationHeader(new PaginationHeader(
            users.CurrentPage,
            users.ItemsPerPage,
            users.TotalItems,
            users.TotalPages
        ));

        return Ok(users);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<PlayerDto>> GetUser(string username)
    {
        return await _usersRepository.GetPlayerAsync(username);
    }

    [HttpGet("friends")]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetFriends()
    {
        return await _usersRepository.GetFriendsAsync(User.GetUsername());
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
}
