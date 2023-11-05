namespace API.DTOs;

public class LikedUserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public AvatarDto Avatar { get; set; }
    public DateTime LastActive { get; set; }
}
