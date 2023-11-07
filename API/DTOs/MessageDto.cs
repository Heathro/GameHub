namespace API.DTOs;

public class MessageDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderUsername { get; set; }
    public AvatarDto SenderAvatar { get; set; }
    public int RecipientId { get; set; }
    public string RecipientUsername { get; set; }
    public AvatarDto RecipientAvatar { get; set; }
    public string Content { get; set; }
    public DateTime MessageSent { get; set; }
    public DateTime? MessageRead { get; set; }
}
