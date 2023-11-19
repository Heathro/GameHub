using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IFriendsRepository
{
    Task<Friendship> GetFriendship(int inviterId, int inviteeId);
    Task<FriendshipDto> GetFriend(int currentUserId, int candidateId);
    Task<IEnumerable<FriendshipDto>> GetFriends(int userId, 
        FriendStatus friendStatus, FriendRequestType requestType);
    Task<AppUser> GetUserWithFriends(int userId);
    Task<bool> SaveAllAsync();
}
