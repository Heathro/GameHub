using API.Helpers;

namespace API.DTOs;

public class FriendshipDto
{
    public PlayerDto Player { get; set; }
    public FriendStatus Status { get; set; }
}
