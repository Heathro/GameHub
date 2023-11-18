using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IFriendsRepository
{
    Task<Friendship> GetFriendship(int inviterId, int inviteeId);
    Task<FriendshipDto> GetFriend(int currentUserId, int candidateId);
    Task<IEnumerable<FriendshipDto>> GetActiveFriends(int userId);
    Task<IEnumerable<Friendship>> GetFriendRequests(int userId);
    Task<AppUser> GetUserWithInvitees(int userId);
    Task<bool> SaveAllAsync();
}
