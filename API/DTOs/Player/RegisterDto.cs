using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class RegisterDto
{
    private const string UserNameRegex = @"^[a-zA-Z0-9]+$";
    private const string UserNameMessage = "Username can only contain letters and numbers.";
    private const string PasswordRegex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$";
    private const string PasswordMessage = "Password must have at least 8 characters, at least one uppercase letter, one lowercase letter, one digit and one special character.";

    [Required]
    [StringLength(24)]
    [RegularExpression(UserNameRegex, ErrorMessage = UserNameMessage)]
    public string UserName { get; set; }
    [Required]
    [RegularExpression(PasswordRegex, ErrorMessage = PasswordMessage)]
    public string Password { get; set; }
}
