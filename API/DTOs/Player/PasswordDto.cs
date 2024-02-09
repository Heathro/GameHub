using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class PasswordDto
{   
    private const string Regex = @"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,16}$";
    private const string Message = "Password must be 8 to 16 characters, at least one uppercase letter, one lowercase letter, one digit and one special character.";
 
    [Required]   
    [RegularExpression(Regex, ErrorMessage = Message)]
    public string OldPassword { get; set; }
    [Required]  
    [RegularExpression(Regex, ErrorMessage = Message)]
    public string NewPassword { get; set; }
}