using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Helpers;
using API.DTOs;

namespace API.Controllers;

public class AdminController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IImageService _imageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly INotificationCenter _notificationCenter;

    public AdminController(UserManager<AppUser> userManager, IImageService imageService,
        IUnitOfWork unitOfWork, IMapper mapper, INotificationCenter notificationCenter)
    {
        _userManager = userManager;
        _imageService = imageService;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationCenter = notificationCenter;
    }

    [Authorize(Policy = "AdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult<PagedList<UserRoleDto>>> GetUsersWithRoles(
        [FromQuery]PaginationParams paginationParams)
    {
        var query = _userManager.Users
            .Where(u => u.UserName != User.GetUsername() && u.UserName != "Admin")
            .OrderBy(u => u.UserName);

        var users = await PagedList<UserRoleDto>.CreateAsync
        (
            query.ProjectTo<UserRoleDto>(_mapper.ConfigurationProvider).AsNoTracking(), 
            paginationParams.CurrentPage, 
            paginationParams.ItemsPerPage
        );

        Response.AddPaginationHeader(new PaginationHeader(
            users.CurrentPage,
            users.ItemsPerPage,
            users.TotalItems,
            users.TotalPages
        ));
        
        return Ok(users);
    }

    [Authorize(Policy = "AdminRole")]
    [HttpPost("edit-roles/{username}")]
    public async Task<ActionResult> EditRoles(string username, [FromQuery]string roles)
    {
        if (string.IsNullOrEmpty(roles)) return BadRequest("Select at least one role");

        var user = await _userManager.FindByNameAsync(username);
        if (user == null) return NotFound();

        var userRoles = await _userManager.GetRolesAsync(user);
        var selectedRoles = roles.Split(",");

        var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
        if (!result.Succeeded) return BadRequest("Failed to add to roles");

        result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
        if (!result.Succeeded) return BadRequest("Failed to remove roles");

        return Ok(await _userManager.GetRolesAsync(user));
    }

    [Authorize(Policy = "AdminRole")]
    [HttpDelete("delete-user/{username}")]
    public async Task<ActionResult> DeleteUser(string username)
    {
        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(username);
        if (user == null) return NotFound();

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

            _unitOfWork.GamesRepository.DeleteGame(game);
            
            _notificationCenter.GameDeleted(User.GetUsername(), game.Id);
        }

        await _unitOfWork.Complete();

        await _userManager.DeleteAsync(user);

        _notificationCenter.UserDeleted(User.GetUsername(), username);

        return Ok();       
    }

    [Authorize(Policy = "AdminModeratorRole")]
    [HttpGet("games-for-moderation")]
    public async Task<ActionResult<PagedList<GameDto>>> GetGamesForModeration(
        [FromQuery]PaginationParams paginationParams)
    {
        var games = await _unitOfWork.GamesRepository.GetGamesForModerationAsync(paginationParams);

        Response.AddPaginationHeader(new PaginationHeader(
            games.CurrentPage,
            games.ItemsPerPage,
            games.TotalItems,
            games.TotalPages
        ));

        return Ok(games);
    }

    [Authorize(Policy = "AdminModeratorRole")]
    [HttpDelete("delete-game/{title}")]
    public async Task<ActionResult> DeleteGame(string title)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        var posterPublicId = game.Poster.PublicId;
        if (posterPublicId != null)
        {
            var deletingResult = await _imageService.DeleteImageAsync(posterPublicId);
            if (deletingResult.Error != null) return BadRequest(deletingResult.Error.Message);
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

        _unitOfWork.GamesRepository.DeleteGame(game);

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.GameDeleted(User.GetUsername(), game.Id);

            return Ok();
        }

        return BadRequest("Failed to delete game");
    }

    [Authorize(Policy = "AdminModeratorRole")]
    [HttpGet("reviews-for-moderation")]
    public async Task<ActionResult<PagedList<ReviewModerationDto>>> GetReviewsForModeration(
        [FromQuery]PaginationParams paginationParams)
    {
        var users = await _unitOfWork.ReviewsRepository.GetReviewsForModeration(paginationParams);

        Response.AddPaginationHeader(new PaginationHeader(
            users.CurrentPage,
            users.ItemsPerPage,
            users.TotalItems,
            users.TotalPages
        ));
        
        return Ok(users);
    }

    [Authorize(Policy = "AdminModeratorRole")]
    [HttpPut("approve-review/{id}")]
    public async Task<ActionResult> ApproveReview(int id)
    {
        var review = await _unitOfWork.ReviewsRepository.GetReviewByIdAsync(id);
        if (review == null) return NotFound();

        review.IsApproved = true;

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.ReviewPosted(User.GetUsername(), _mapper.Map<ReviewDto>(review));

            return Ok();
        }

        return BadRequest("Failed to approve review");
    }

    [Authorize(Policy = "AdminModeratorRole")]
    [HttpDelete("reject-review/{id}")]
    public async Task<ActionResult> RejectReview(int id)
    {
        var review = await _unitOfWork.ReviewsRepository.GetReviewByIdAsync(id);
        if (review == null) return NotFound();

        _unitOfWork.ReviewsRepository.DeleteReview(review);

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.ReviewDeleted(User.GetUsername(), id);
            
            return Ok();
        }
        
        return BadRequest("Failed to delete review");
    }
}
