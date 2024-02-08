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
    private readonly INotificationCenter _notificationCenter;
    private readonly string storagePath = "storage";

    public UsersController(UserManager<AppUser> userManager, IImageService imageService, 
        IUnitOfWork unitOfWork, IMapper mapper, INotificationCenter notificationCenter)
    {
        _userManager = userManager;
        _imageService = imageService;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationCenter = notificationCenter;
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
        var username = User.GetUsername();

        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(username);
        if (user == null) return NotFound();

        var updatedUser = _mapper.Map(playerEditDto, user);

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.UserUpdated(username, _mapper.Map<PlayerDto>(updatedUser));

            return NoContent();
        }

        return BadRequest("No changes were detected");
    }

    [HttpPut("update-avatar")]
    public async Task<ActionResult<AvatarDto>> UpdateAvatar(IFormFile file)
    {
        var username = User.GetUsername();

        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(username);
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

        if (await _unitOfWork.Complete())
        {
            var updatedAvatar = _mapper.Map<AvatarDto>(user.Avatar);
            _notificationCenter.AvatarUpdated(username, user.Id, updatedAvatar);

            return _mapper.Map<AvatarDto>(user.Avatar);
        }

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

        var games = await _unitOfWork.GamesRepository.GetGamesForUserAsync(User.GetUserId());
        foreach (var game in games)
        {
            var posterPublicId = game.Poster.PublicId;
            if (posterPublicId != null)
            {
                var result = await _imageService.DeleteImageAsync(posterPublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
                game.Poster.Url = "";
                game.Poster.PublicId = null;
            }

            foreach (var screenshot in game.Screenshots)
            {
                if (screenshot.PublicId != null)
                {
                    var result = await _imageService.DeleteImageAsync(screenshot.PublicId);
                    if (result.Error != null) return BadRequest(result.Error.Message);
                }
            }
            game.Screenshots.Clear();

            if (!string.IsNullOrEmpty(game.Files.WindowsName))
            {
                var windowsFilePath = Path.Combine(storagePath, game.Files.WindowsName);
                if (System.IO.File.Exists(windowsFilePath)) System.IO.File.Delete(windowsFilePath);
            }
            if (!string.IsNullOrEmpty(game.Files.MacosName))
            {
                var macosFilePath = Path.Combine(storagePath, game.Files.MacosName);
                if (System.IO.File.Exists(macosFilePath)) System.IO.File.Delete(macosFilePath);
            }
            if (!string.IsNullOrEmpty(game.Files.LinuxName))
            {
                var linuxNameFilePath = Path.Combine(storagePath, game.Files.LinuxName);
                if (System.IO.File.Exists(linuxNameFilePath)) System.IO.File.Delete(linuxNameFilePath);
            }

            _unitOfWork.GamesRepository.DeleteGame(game);

            _notificationCenter.GameDeleted(username, game.Id);
        }

        await _unitOfWork.Complete();
      
        await _userManager.DeleteAsync(user);
        
        _notificationCenter.UserDeleted(username, user.UserName, user.Id);

        return Ok();
    }
}
