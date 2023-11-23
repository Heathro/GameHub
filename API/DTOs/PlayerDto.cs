using API.Helpers;

namespace API.DTOs;

public class PlayerDto
{
    public int Id { get; set; }
    public string UserName { get; set; }
    public AvatarDto Avatar { get; set; }
    public string Realname { get; set; }
    public string Summary { get; set; }
    public string Country { get; set; }
    public string City { get; set; }
    public FriendStatus Status { get; set; }
    public FriendRequestType Type { get; set; }
    public DateTime Created { get; set; }
    public DateTime LastActive { get; set; }
}
