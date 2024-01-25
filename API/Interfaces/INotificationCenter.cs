using API.DTOs;

namespace API.Interfaces;

public interface INotificationCenter
{
    void UserRegisted(PlayerDto player);
    void UserUpdated(string currentUsername, PlayerDto player);
    void AvatarUpdated(string currentUsername, int userId, AvatarDto avatar);
    void UserDeleted(string currentUsername, string deletedUsername);
    void FriendshipRequested(PlayerDto initiator, string targetUsername);
    void FriendshipCancelled(PlayerDto initiator, string targetUsername);
    void FriendshipAccepted(PlayerDto initiator, string targetUsername);
    void GamePublished(string currentUsername, GameDto game);
    void GameUpdated(string currentUsername, GameDto game);
    void PosterUpdated(string currentUsername, int gameId, PosterDto poster);
    void ScreenshotAdded(string currentUsername, int gameId, ScreenshotDto screenshot);
    void ScreenshotDeleted(string currentUsername, int gameId, int screenshotId);
    void GameLiked(string currentUsername, int gameId);
    void GameDeleted(string currentUsername, int gameId);
    void ReviewApproved(string currentUsername, ReviewDto review);
    void ReviewDeleted(string currentUsername, int reviewId);
    void ReviewPosted(string currentUsername, ReviewDto review);
}
