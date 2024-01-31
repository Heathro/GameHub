using Microsoft.AspNetCore.SignalR;
using API.Interfaces;
using API.DTOs;

namespace API.SignalR;

public class NotificationCenter : INotificationCenter
{
    private readonly IHubContext<PresenceHub> _presenceHub;

    public NotificationCenter(IHubContext<PresenceHub> presenceHub)
    {
        _presenceHub = presenceHub;
    }

    public async void UserRegisted(PlayerDto player)
    {
        await _presenceHub.Clients.All.SendAsync("UserRegisted", player);
    }
    
    public async void UserUpdated(string currentUsername, PlayerDto player)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections).SendAsync("UserUpdated", player);
    }

    public async void AvatarUpdated(string currentUsername, int userId, AvatarDto avatar)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("AvatarUpdated", new { userId, avatar});
    }

    public async void UserDeleted(string currentUsername, string deletedUsername, int deletedId)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;
        
        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("UserDeleted", new { deletedUsername, deletedId });
    }

    public async void FriendshipRequested(PlayerDto initiator, string targetUsername)
    {
        var targetConnections = await PresenceTracker.GetConnectionsForUser(targetUsername);
        if (targetConnections == null) return;

        await _presenceHub.Clients.Clients(targetConnections).SendAsync("FriendshipRequested", initiator);
    }

    public async void FriendshipCancelled(PlayerDto initiator, string targetUsername)
    {
        var targetConnections = await PresenceTracker.GetConnectionsForUser(targetUsername);
        if (targetConnections == null) return;

        await _presenceHub.Clients.Clients(targetConnections).SendAsync("FriendshipCancelled", initiator);
    }

    public async void FriendshipAccepted(PlayerDto initiator, string targetUsername)
    {
        var targetConnections = await PresenceTracker.GetConnectionsForUser(targetUsername);
        if (targetConnections == null) return;

        await _presenceHub.Clients.Clients(targetConnections).SendAsync("FriendshipAccepted", initiator);
    }

    public async void GamePublished(string currentUsername, GameDto game)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections).SendAsync("GamePublished", game);
    }

    public async void GameUpdated(string currentUsername, GameDto game)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections).SendAsync("GameUpdated", game);
    }
    
    public async void PosterUpdated(string currentUsername, int gameId, PosterDto poster)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("PosterUpdated", new { gameId, poster });
    }

    public async void ScreenshotAdded(string currentUsername, int gameId, ScreenshotDto screenshot)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("ScreenshotAdded", new { gameId, screenshot });
    }

    public async void ScreenshotDeleted(string currentUsername, int gameId, int screenshotId)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("ScreenshotDeleted", new { gameId, screenshotId });
    }

    public async void GameLiked(string currentUsername, int gameId, int userId)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;
        
        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("GameLiked", new { gameId, userId });
    }
    
    public async void GameUnliked(string currentUsername, int gameId, int userId)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;
        
        await _presenceHub.Clients.AllExcept(currentUserConnections)
            .SendAsync("GameUnliked", new { gameId, userId });
    }
    
    public async void GameDeleted(string currentUsername, int gameId)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;
        
        await _presenceHub.Clients.AllExcept(currentUserConnections).SendAsync("GameDeleted", gameId);
    }

    public async void ReviewApproved(string currentUsername, ReviewDto review)
    {
        await _presenceHub.Clients.All.SendAsync("ReviewApproved", review);
    }
    
    public async void ReviewPosted(string currentUsername)
    {
        var moderatorsConnections = await PresenceTracker.GetConnectionsForModerators(currentUsername);
        if (moderatorsConnections == null) return;

        await _presenceHub.Clients.Clients(moderatorsConnections).SendAsync("ReviewPosted");
    }
    
    public async void ReviewDeleted(string currentUsername, int reviewId)
    {
        var currentUserConnections = await PresenceTracker.GetConnectionsForUser(currentUsername);
        if (currentUserConnections == null) return;

        await _presenceHub.Clients.AllExcept(currentUserConnections).SendAsync("ReviewDeleted", reviewId);
    }
}