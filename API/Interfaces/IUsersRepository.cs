using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUsersRepository
{    
    Task<AppUser> GetUserByIdAsync(int id);
    Task<AppUser> GetUserByUsernameAsync(string userName);
    Task<PlayerDto> GetPlayerAsync(int currentUserId, string requestedUserName);
    Task<PagedList<PlayerDto>> GetPlayersAsync(PaginationParams paginationParams, int currentUserId);
    Task RegisterLastActivity(string username);
}
