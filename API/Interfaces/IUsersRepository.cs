using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUsersRepository
{    
    Task<PlayerDto> GetPlayerAsync(string username);
    Task<PagedList<PlayerDto>> GetPlayersAsync(PaginationParams paginationParams, string currenUsername);
    Task<AppUser> GetUserByIdAsync(int id);
    Task<AppUser> GetUserByUsernameAsync(string username);
    Task<IEnumerable<AppUser>> GetUsersAsync();
    Task DeleteUser(string username);
    void Update(AppUser user);
    Task<bool> SaveAllAsync();
}
