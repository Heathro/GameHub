using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IFriendsRepository
{
    Task<Friendship> GetFriendship(int inviterId, int inviteeId);
    Task<FriendshipDto> GetFriend(int currentUserId, int candidateId);
    Task<IEnumerable<FriendshipDto>> GetFriendsWithStatus(int userId, FriendStatus status);
    Task<AppUser> GetUserWithInvitees(int userId);
    Task<bool> SaveAllAsync();
}
