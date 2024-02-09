using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class PasswordDto
{   
    private const string Regex = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$";
    private const string Message = "Password must have at least 8 characters, at least one uppercase letter, one lowercase letter, one digit and one special character.";
    
    [Required]   
    [RegularExpression(Regex, ErrorMessage = Message)]
    public string OldPassword { get; set; }
    [Required]  
    [RegularExpression(Regex, ErrorMessage = Message)]
    public string NewPassword { get; set; }
}