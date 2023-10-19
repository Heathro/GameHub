namespace API.Entities;

public class AppUser
{
    public int Id { get; set; }
    public string Username { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    public Avatar Avatar { get; set; }
    public string Realname { get; set; }
    public string Summary { get; set; }
    public string Country { get; set; }
    public string City { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
}