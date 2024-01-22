using API.DTOs;

namespace API.Interfaces;

public interface INotificationCenter
{
    void UserDeleted(string currentUsername, string deletedUsername);
    void ReviewPosted(string currentUsername, ReviewDto review);
    void FriendshipRequested(PlayerDto initiator, string targetUsername);
    void FriendshipCancelled(PlayerDto initiator, string targetUsername);
    void FriendshipAccepted(PlayerDto initiator, string targetUsername);
    void GameUpdated(string currentUsername, GameDto game);
    void PosterUpdated(string currentUsername, int gameId, PosterDto poster);
    void ScreenshotAdded(string currentUsername, int gameId, ScreenshotDto screenshot);
    void ScreenshotDeleted(string currentUsername, int gameId, int screenshotId);
    void GameDeleted(string currentUsername, int gameId);
    void GameLiked(string currentUsername, int gameId);
    void GamePublished(string currentUsername, GameDto game);
    void ReviewDeleted(string currentUsername, int reviewId);
    void UserUpdated(string currentUsername, PlayerDto player);
    void AvatarUpdated(string currentUsername, int userId, AvatarDto avatar);
    void UserRegisted(PlayerDto player);
}
