using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Controllers;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Helpers;
using API.DTOs;

namespace API;

public class AdminController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IUsersRepository _usersRepository;
    private readonly IMapper _mapper;

    public AdminController(UserManager<AppUser> userManager, IUsersRepository usersRepository,
        IMapper mapper)
    {
        _userManager = userManager;
        _usersRepository = usersRepository;
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
        await _usersRepository.DeleteUserAsync(username);

        if (await _usersRepository.SaveAllAsync()) return BadRequest("Failed to delete user");

        return Ok();
    }

    [Authorize(Policy = "AdminModeratorRole")]
    [HttpGet("games-for-moderation")]
    public ActionResult GetGamesForModeration()
    {
        return Ok("ADMIN AND MODERATOR");
    }
}
