using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IFriendsRepository
{
    Task<Friendship> GetFriendshipAsync(int inviterId, int inviteeId);
    Task<AppUser> GetUserWithFriendsAsync(int userId);
    Task<IEnumerable<PlayerDto>> GetFriendsAsync(int userId);
    Task<List<int>> GetActiveFriendsAsync(int userId);
}
