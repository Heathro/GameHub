using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class GamePublishDto
{    
    [Required]
    [StringLength(32)]
    public string Title { get; set; }
    public string Description { get; set; }
}
