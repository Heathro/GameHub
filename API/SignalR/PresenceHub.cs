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
        var isOnline = await PresenceTracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);
        if (isOnline)
        {
            await Clients.Others.SendAsync("UserIsOnline", new
            {
                username = Context.User.GetUsername(),
                friends = await _unitOfWork.FriendsRepository.GetActiveFriendsAsync(Context.User.GetUserId())
            });
        }

        var currentUsers = await PresenceTracker.GetOnlineUsers();
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);

        await _unitOfWork.UsersRepository.RegisterLastActivity(Context.User.GetUsername());
        await _unitOfWork.Complete();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var isOffline = await PresenceTracker
            .UserDisconnected(Context.User.GetUsername(), Context.ConnectionId);

        if (isOffline)
        {
            await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUsername());
        }

        await _unitOfWork.UsersRepository.RegisterLastActivity(Context.User.GetUsername());
        await _unitOfWork.Complete();

        await base.OnDisconnectedAsync(exception);
    }
}