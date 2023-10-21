using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    [Required]
    [StringLength(24)]
    public string Username { get; set; }
    [Required]
    [StringLength(16, MinimumLength = 8)]
    public string Password { get; set; }
}
