using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;

namespace API.Data;

public class MessagesRepository : IMessagesRepository
{
    private readonly DataContext _context;

    public MessagesRepository(DataContext context)
    {
        _context = context;
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

    public async Task<PagedList<MessageDto>> GetMessagesForUser()
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(int currentUserI, int recipientId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
