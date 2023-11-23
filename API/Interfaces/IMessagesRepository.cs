using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IMessagesRepository
{
    void AddMessage(Message message);
    void DeleteMessage(Message message);
    void DeleteMessages(IEnumerable<Message> messages);
    Task<Message> GetMessageAsync(int id);
    Task<IEnumerable<Message>> GetMessagesAsync(string currentUsername, string recipientUsername);
    Task<IEnumerable<MessageDto>> GetMessageThreadAsync(string currentUsername, string recipientUsername);
    Task DeleteUserMessagesAsync(string username);
    Task<IEnumerable<PlayerDto>> GetCompanionsAsync(string username);
    Task<bool> SaveAllAsync();
}
