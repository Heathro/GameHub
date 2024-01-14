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

    public AdminController(UserManager<AppUser> userManager, IImageService imageService,
        IUnitOfWork unitOfWork, IMapper mapper)
    {
        _userManager = userManager;
        _imageService = imageService;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
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

        var avatarPublicId = user.Avatar.PublicId;
        if (avatarPublicId != null) await _imageService.DeleteImageAsync(avatarPublicId);

        await _unitOfWork.MessagesRepository.DeleteUserMessagesAsync(username);
        await _unitOfWork.Complete();

        await _userManager.DeleteAsync(user);

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
        _unitOfWork.ReviewsRepository.ApproveReview(id);

        if (await _unitOfWork.Complete()) return Ok();

        return BadRequest("Failed to approve review");
    }
}
