﻿namespace API.SignalR;

public class PresenceTracker
{
    private static readonly Dictionary<string, List<string>> OnlineUsers = new();

    public static Task<bool> UserConnected(string username, string connectionId)
    {
        bool isOnline = false;

        lock(OnlineUsers)
        {
            if (OnlineUsers.ContainsKey(username))
            {
                OnlineUsers[username].Add(connectionId);
            }
            else
            {
                OnlineUsers.Add(username, new List<string>{connectionId});
                isOnline = true;
            }
        }

        return Task.FromResult(isOnline);
    }

    public static Task<bool> UserDisconnected(string username, string connectionId)
    {
        bool isOffline = false;

        lock(OnlineUsers)
        {
            if (!OnlineUsers.ContainsKey(username))
            {
                return Task.FromResult(isOffline);
            }

            OnlineUsers[username].Remove(connectionId);

            if (OnlineUsers[username].Count == 0)
            {
                OnlineUsers.Remove(username);
                isOffline = true;
            }
        }

        return Task.FromResult(isOffline);
    }

    public static Task<List<string>> GetOnlineUsers()
    {
        List<string> onlineUsers;

        lock(OnlineUsers)
        {
            onlineUsers = OnlineUsers.OrderBy(k => k.Key).Select(k => k.Key).ToList();
        }

        return Task.FromResult(onlineUsers);
    }

    public static Task<List<string>> GetConnectionsForUser(string username)
    {
        List<string> connectionIds;

        lock(OnlineUsers)
        {
            connectionIds = OnlineUsers.GetValueOrDefault(username);
        }

        return Task.FromResult(connectionIds);
    }
}