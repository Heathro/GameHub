using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Controllers;
using API.Entities;
using API.Extensions;
using API.Interfaces;

namespace API;

public class AdminController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IUsersRepository _usersRepository;

    public AdminController(UserManager<AppUser> userManager, IUsersRepository usersRepository)
    {
        _userManager = userManager;
        _usersRepository = usersRepository;
    }

    [Authorize(Policy = "AdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        var users = await _userManager.Users
            .Where(u => u.UserName != User.GetUsername() && u.UserName != "Admin")
            .OrderBy(u => u.UserName)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                AvatarUrl = u.Avatar.Url,
                Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
            })
            .ToListAsync();
        
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
        await _usersRepository.DeleteUser(username);

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
