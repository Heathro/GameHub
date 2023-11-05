namespace API.DTOs;

public class PlayerDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public AvatarDto Avatar { get; set; }
    public string Realname { get; set; }
    public string Summary { get; set; }
    public string Country { get; set; }
    public string City { get; set; }
    public DateTime Created { get; set; }
    public DateTime LastActive { get; set; }
}
