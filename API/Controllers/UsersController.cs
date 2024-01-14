using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.DTOs;
using API.Interfaces;
using API.Extensions;
using API.Helpers;
using Microsoft.AspNetCore.Identity;
using API.Entities;

namespace API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IImageService _imageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UsersController(UserManager<AppUser> userManager, IImageService imageService, 
        IUnitOfWork unitOfWork, IMapper mapper)
    {
        _userManager = userManager;
        _imageService = imageService;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }    

    [HttpGet("list")]
    public async Task<ActionResult<PagedList<PlayerDto>>> GetPlayersAsync(
        [FromQuery]PaginationParams paginationParams)
    {
        var players = await _unitOfWork.UsersRepository.GetPlayersAsync(paginationParams, User.GetUserId());

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
        var player = await _unitOfWork.UsersRepository.GetPlayerAsync(User.GetUserId(), username);

        return Ok(player);
    }

    [HttpPut("edit-profile")]
    public async Task<ActionResult> UpdateUser(PlayerEditDto playerEditDto)
    {
        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(User.GetUsername());

        if (user == null) return NotFound();

        _mapper.Map(playerEditDto, user);

        if (await _unitOfWork.Complete()) return NoContent();

        return BadRequest("No changes were detected");
    }

    [HttpPut("update-avatar")]
    public async Task<ActionResult<AvatarDto>> UpdateAvatar(IFormFile file)
    {
        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(User.GetUsername());

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

        if (await _unitOfWork.Complete()) return _mapper.Map<AvatarDto>(user.Avatar);

        return BadRequest("Failed to update photo");
    }

    [HttpDelete("delete-user")]
    public async Task<ActionResult> DeleteUser()
    {
        var username = User.GetUsername();

        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(username);

        var avatarPublicId = user.Avatar.PublicId;
        if (avatarPublicId != null) await _imageService.DeleteImageAsync(avatarPublicId);

        await _unitOfWork.MessagesRepository.DeleteUserMessagesAsync(username);
        await _unitOfWork.Complete();

        await _userManager.DeleteAsync(user);

        return Ok();
    }
}
