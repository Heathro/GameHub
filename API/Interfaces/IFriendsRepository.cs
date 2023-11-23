using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IFriendsRepository
{
    Task<Friendship> GetFriendship(int inviterId, int inviteeId);
    Task<AppUser> GetUserWithFriends(int userId);
    Task<PagedList<PlayerDto>> GetPlayersAsync(PaginationParams paginationParams, int currentUserId);
    Task<PlayerDto> GetPlayerAsync(int currentUserId, string requestedUserName);
    Task<IEnumerable<PlayerDto>> GetFriendsAsync(int userId);
    Task<bool> SaveAllAsync();
}
