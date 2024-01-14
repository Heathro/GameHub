using Microsoft.AspNetCore.SignalR;
using API.Extensions;
using API.Interfaces;

namespace API.SignalR;

public class PresenceHub : Hub
{
    private readonly IUsersRepository _usersRepository;
    private readonly IFriendsRepository _friendsRepository;

    public PresenceHub(IUsersRepository usersRepository, IFriendsRepository friendsRepository)
    {
        _usersRepository = usersRepository;
        _friendsRepository = friendsRepository;
    }

    public override async Task OnConnectedAsync()
    {
        var isOnline = await PresenceTracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);
        if (isOnline)
        {
            await Clients.Others.SendAsync("UserIsOnline", new
            {
                username = Context.User.GetUsername(),
                friends = await _friendsRepository.GetActiveFriendsAsync(Context.User.GetUserId())
            });
        }

        var currentUsers = await PresenceTracker.GetOnlineUsers();
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);

        await _usersRepository.RegisterLastActivity(Context.User.GetUsername());
        await _usersRepository.SaveAllAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var isOffline = await PresenceTracker
            .UserDisconnected(Context.User.GetUsername(), Context.ConnectionId);

        if (isOffline)
        {
            await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUsername());
        }

        await _usersRepository.RegisterLastActivity(Context.User.GetUsername());
        await _usersRepository.SaveAllAsync();

        await base.OnDisconnectedAsync(exception);
    }
}