using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IUsersRepository
{    
    Task<PlayerDto> GetPlayerAsync(string username);
    Task<IEnumerable<PlayerDto>> GetPlayersAsync();
    Task<AppUser> GetUserByIdAsync(int id);
    Task<AppUser> GetUserByUsernameAsync(string username);
    Task<IEnumerable<AppUser>> GetUsersAsync();
    void Update(AppUser user);
    Task<bool> SaveAllAsync();
}
