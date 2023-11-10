using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUsersRepository
{    
    Task<PlayerDto> GetPlayerAsync(string username);
    Task<PagedList<PlayerDto>> GetPlayersAsync(PaginationParams paginationParams, string currenUsername);
    Task<ActionResult<IEnumerable<PlayerDto>>> GetFriendsAsync(string username);
    Task<AppUser> GetUserByIdAsync(int id);
    Task<AppUser> GetUserByUsernameAsync(string username);
    Task<IEnumerable<AppUser>> GetUsersAsync();
    void Update(AppUser user);
    Task<bool> SaveAllAsync();
}
