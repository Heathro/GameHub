using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Platforms")]
public class Platforms
{
    public int Id { get; set; }
    public bool Windows { get; set; }
    public bool Macos { get; set; }
    public bool Linux { get; set; }
    public int GameId { get; set; }
    public Game Game { get; set; }
}
