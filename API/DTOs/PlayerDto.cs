namespace API.DTOs;

public class PlayerDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Avatar { get; set; }
    public string Country { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
}
