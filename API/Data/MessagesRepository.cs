using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

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

    public async Task<Message> GetMessage(int id)
    {
        return await _context.Messages.FindAsync(id);
    }

    public async Task<PagedList<MessageDto>> GetMessagesForUser(
        PaginationParams paginationParams, string username)
    {
        var query = _context.Messages
            .Where(m => m.SenderUsername == username || m.RecipientUsername == username)
            .OrderBy(m => m.MessageSent).AsQueryable();

        return await PagedList<MessageDto>.CreateAsync
        (
            query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider).AsNoTracking(), 
            paginationParams.CurrentPage, 
            paginationParams.ItemsPerPage
        );
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender).ThenInclude(u => u.Avatar)
            .Include(m => m.Recipient).ThenInclude(u => u.Avatar)
            .Where(
                m => m.RecipientUsername == currentUsername &&
                     m.SenderUsername == recipientUsername ||
                     m.RecipientUsername == recipientUsername &&
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

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
