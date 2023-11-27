using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class GamePublishDto
{    
    [Required]
    [StringLength(32)]
    public string Title { get; set; }
    public string Description { get; set; }
    public PlatformsDto Platforms { get; set; }
    public GenresDto Genres { get; set; }
}
