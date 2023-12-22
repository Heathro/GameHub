using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class GameEditDto
{
    public int Id { get; set; }
    [Required]
    [StringLength(32)]
    public string Title { get; set; }
    public string Description { get; set; }
    public PlatformsDto Platforms { get; set; }
    public GenresDto Genres { get; set; }
    public string Video { get; set; }
}
