using API.Entities;

namespace API.Interfaces;

public interface IFriendsRepository
{
    Task<Friendship> GetFriendship(int inviterId, int inviteeId);
    Task<IEnumerable<Friendship>> GetInviters(int userId);
    Task<IEnumerable<Friendship>> GetInvitees(int gameId);
    Task<AppUser> GetUserWithInvitees(int userId);
    Task<bool> SaveAllAsync();
}
