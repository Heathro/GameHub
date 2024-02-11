using Microsoft.AspNetCore.SignalR;
using API.Extensions;
using API.Interfaces;

namespace API.SignalR;

public class PresenceHub : Hub
{
    private readonly IUnitOfWork _unitOfWork;

    public PresenceHub(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public override async Task OnConnectedAsync()
    {
        var currentUser = Context.User.GetUsername();

        if (Context.User.IsInRole("Admin") || Context.User.IsInRole("Moderator"))
        {
            PresenceTracker.ModeratorConnected(currentUser, Context.ConnectionId);
        }

        var isOnline = await PresenceTracker.UserConnected(currentUser, Context.ConnectionId);
        if (isOnline)
        {
            await Clients.Others.SendAsync("UserIsOnline", new
            {
                username = currentUser,
                friends = await _unitOfWork.FriendsRepository.GetActiveFriendsAsync(Context.User.GetUserId())
            });
        }

        var currentUsers = await PresenceTracker.GetOnlineUsers();
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);

        var unreadCompanions = await _unitOfWork.MessagesRepository.GetUnreadCompanionsAsync(currentUser);
        await Clients.Caller.SendAsync("GetUnreadCompanions", unreadCompanions);

        await _unitOfWork.UsersRepository.RegisterLastActivity(currentUser);
        await _unitOfWork.Complete();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {   
        var currentUser = Context.User.GetUsername();

        if (Context.User.IsInRole("Admin") || Context.User.IsInRole("Moderator"))
        {
            PresenceTracker.ModeratorDisconnected(currentUser, Context.ConnectionId);
        }

        var isOffline = await PresenceTracker.UserDisconnected(currentUser, Context.ConnectionId);
        if (isOffline)
        {
            await Clients.Others.SendAsync("UserIsOffline", currentUser);
        }

        await _unitOfWork.UsersRepository.RegisterLastActivity(currentUser);
        await _unitOfWork.Complete();

        await base.OnDisconnectedAsync(exception);
    }
}