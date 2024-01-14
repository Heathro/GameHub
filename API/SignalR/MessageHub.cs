using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Interfaces;
using API.Extensions;
using API.Entities;
using API.DTOs;

namespace API.SignalR;

[Authorize]
public class MessageHub : Hub
{
    private readonly IMessagesRepository _messagesRepository;
    private readonly IUsersRepository _usersRepository;
    private readonly IMapper _mapper;
    private readonly IHubContext<PresenceHub> _presenceHub;

    public MessageHub(IMessagesRepository messagesRepository, IUsersRepository usersRepository,
        IMapper mapper, IHubContext<PresenceHub> presenceHub)
    {
        _messagesRepository = messagesRepository;
        _usersRepository = usersRepository;
        _mapper = mapper;
        _presenceHub = presenceHub;
    }

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();

        var caller = Context.User.GetUsername();
        var other = httpContext.Request.Query["user"];

        var group = GetGroupName(caller, other);
        await Groups.AddToGroupAsync(Context.ConnectionId, group);
        await AddToGroup(group);

        var callerMessages = await _messagesRepository.GetMessageThreadAsync(caller, other);
        await Clients.Caller.SendAsync("RecieveMessageThread", callerMessages);
        
        await Clients.OthersInGroup(group).SendAsync("ConversantJoined");
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await RemoveFromGroup();
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var username = Context.User.GetUsername();

        if (username == createMessageDto.RecipientUsername)
        {
            throw new HubException("You cannot send messages to yourself");
        }

        var sender = await _usersRepository.GetUserByUsernameAsync(username);
        sender.LastActive = DateTime.UtcNow;

        var recipient = await _usersRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

        if (recipient == null) throw new HubException("Not found user");

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        var groupName = GetGroupName(sender.UserName, recipient.UserName);

        var group = await _messagesRepository.GetGroup(groupName);
        if (group.Connections.Any(c => c.Username == recipient.UserName))
        {
            message.MessageRead = DateTime.UtcNow;
        }
        else
        {
            var connections = await PresenceTracker.GetConnectionsForUser(recipient.UserName);
            if (connections != null)
            {
                await _presenceHub.Clients.Clients(connections).SendAsync("IncomingMessage", new
                {
                    sender = _mapper.Map<PlayerDto>(sender),
                    content = message.Content
                });
            }
        }

        _messagesRepository.AddMessage(message);

        if (await _messagesRepository.SaveAllAsync())
        {
            var messageDto = _mapper.Map<MessageDto>(message);
            await Clients.Group(groupName).SendAsync("NewMessage", messageDto);
        }
    }

    public async Task DeleteMessage(int id)
    {
        var currentUsername = Context.User.GetUsername();
        var message = await _messagesRepository.GetMessageAsync(id);

        if (message.SenderUsername != currentUsername && message.RecipientUsername != currentUsername)
        {
            throw new HubException("This message not belong to you");
        }

        if (message.SenderUsername == currentUsername) message.SenderDeleted = true;
        if (message.RecipientUsername == currentUsername)message.RecipientDeleted = true;

        if (message.SenderDeleted && message.RecipientDeleted)
        {
            _messagesRepository.DeleteMessage(message);
        }

        await _usersRepository.RegisterLastActivity(currentUsername);
        await _messagesRepository.SaveAllAsync();
    }    
    
    public async Task DeleteMessages(string recipientUsername)
    {
        var currentUsername = Context.User.GetUsername();
        var messages = await _messagesRepository.GetMessagesAsync(currentUsername, recipientUsername);

        foreach (var message in messages)
        {
            if (message.SenderUsername == currentUsername) message.SenderDeleted = true;
            if (message.RecipientUsername == currentUsername) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
            {
                _messagesRepository.DeleteMessage(message);
            }
        }

        await _usersRepository.RegisterLastActivity(currentUsername);
        await _messagesRepository.SaveAllAsync();
    }

    private string GetGroupName(string caller, string other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }

    private async Task<bool> AddToGroup(string name)
    {
        var group = await _messagesRepository.GetGroup(name);
        var connection = new Connection(Context.ConnectionId, Context.User.GetUsername());

        if (group == null)
        {
            group = new Group(name);
            _messagesRepository.AddGroup(group);
        }

        group.Connections.Add(connection);

        return await _messagesRepository.SaveAllAsync();
    }

    private async Task RemoveFromGroup()
    {
        var connection = await _messagesRepository.GetConnection(Context.ConnectionId);
        _messagesRepository.RemoveConnection(connection);
        await _messagesRepository.SaveAllAsync();
    }
}
