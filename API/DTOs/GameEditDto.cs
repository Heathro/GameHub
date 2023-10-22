using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class GameEditDto
{
    [Required]
    [StringLength(36)]
    public string Title { get; set; }
    public string Description { get; set; }
}
