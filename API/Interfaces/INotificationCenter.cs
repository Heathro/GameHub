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
}
