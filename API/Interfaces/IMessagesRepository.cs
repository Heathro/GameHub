using System.Xml.Serialization;
using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IMessagesRepository
{
    void AddMessage(Message message);
    void DeleteMessage(Message message);
    Task<Message> GetMessageAsync(int id);
    Task<IEnumerable<Message>> GetMessagesAsync(string currentUsername, string recipientUsername);
    Task<IEnumerable<MessageDto>> GetMessageThreadAsync(string currentUsername, string recipientUsername);
    Task DeleteUserMessagesAsync(string username);
    Task<IEnumerable<PlayerDto>> GetCompanionsAsync(string username);
    Task<bool> SaveAllAsync();
    void AddGroup(Group group);
    void RemoveConnection(Connection connection);
    Task<Connection> GetConnection(string connectionId);
    Task<Group> GetGroup(string name);
}
