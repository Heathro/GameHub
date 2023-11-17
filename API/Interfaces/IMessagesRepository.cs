using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMessagesRepository
{
    void AddMessage(Message message);
    void DeleteMessage(Message message);
    void DeleteMessages(IEnumerable<Message> messages);
    Task<Message> GetMessage(int id);
    Task<IEnumerable<Message>> GetMessages(string currentUsername, string recipientUsername);
    Task DeleteUserMessages(string username);
    Task<PagedList<MessageDto>> GetMessagesForUser(PaginationParams paginationParams, string username);
    Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername);
    Task<bool> SaveAllAsync();
}
