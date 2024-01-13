using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Data;

public class MessagesRepository : IMessagesRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public MessagesRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public void AddMessage(Message message)
    {
        _context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        _context.Messages.Remove(message);
    }

    public async Task<Message> GetMessageAsync(int id)
    {
        return await _context.Messages.FindAsync(id);
    }

    public async Task<IEnumerable<Message>> GetMessagesAsync(string currentUsername, string recipientUsername)
    {
        return await _context.Messages.Where(m => 
            m.RecipientUsername == currentUsername && m.SenderUsername == recipientUsername ||
            m.RecipientUsername == recipientUsername && m.SenderUsername == currentUsername
        ).ToListAsync();
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThreadAsync(
        string currentUsername, string recipientUsername)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender).ThenInclude(u => u.Avatar)
            .Include(m => m.Recipient).ThenInclude(u => u.Avatar)
            .Where(m => 
                m.RecipientUsername == currentUsername && !m.RecipientDeleted && 
                m.SenderUsername == recipientUsername ||
                m.RecipientUsername == recipientUsername && !m.SenderDeleted &&
                m.SenderUsername == currentUsername
            )
            .OrderBy(m => m.MessageSent)
            .ToListAsync();

        var unreadMessages = messages.Where(m =>
            m.MessageRead == null && m.RecipientUsername == currentUsername).ToList();

        if (unreadMessages.Any())
        {
            foreach (var message in unreadMessages)
            {
                message.MessageRead = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        return _mapper.Map<IEnumerable<MessageDto>>(messages);
    }

    public async Task DeleteUserMessagesAsync(string username)
    {
        var messages = await _context.Messages
            .Where(m => m.SenderUsername == username || m.RecipientUsername == username)
            .ToListAsync();

        _context.Messages.RemoveRange(messages);
    }

    public async Task<IEnumerable<PlayerDto>> GetCompanionsAsync(string username)
    {        
        var companions = await _context.Messages            
            .Where(m => 
                (m.SenderUsername == username && !m.SenderDeleted) ||
                (m.RecipientUsername == username && !m.RecipientDeleted)
            )
            .OrderByDescending(m => m.MessageSent)
            .Select(u => u.SenderUsername == username ? u.RecipientId : u.SenderId)
            .Distinct()
            .ToListAsync();

        return await _context.Users
            .Include(u => u.Avatar)
            .Where(u => companions.Contains(u.Id))
            .ProjectTo<PlayerDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public void AddGroup(Group group)
    {
        _context.Groups.Add(group);
    }

    public void RemoveConnection(Connection connection)
    {
        _context.Connections.Remove(connection);
    }

    public async Task<Connection> GetConnection(string connectionId)
    {
        return await _context.Connections.FindAsync(connectionId);
    }

    public async Task<Group> GetGroup(string name)
    {
        return await _context.Groups
            .Include(g => g.Connections)
            .FirstOrDefaultAsync(g => g.Name == name);
    }
}
