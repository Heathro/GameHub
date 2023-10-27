using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Genres")]
public class Genres
{
    public int Id { get; set; }

    public bool Action { get; set; }
    public bool Adventure { get; set; }
    public bool Card { get; set; }
    public bool Educational { get; set; }
    public bool Fighting { get; set; }
    public bool Horror { get; set; }
    public bool Platformer { get; set; }
    public bool Puzzle { get; set; }
    public bool Racing { get; set; }
    public bool Rhythm { get; set; }
    public bool Roleplay { get; set; }
    public bool Shooter { get; set; }
    public bool Simulation { get; set; }
    public bool Sport { get; set; }
    public bool Stealth { get; set; }
    public bool Strategy { get; set; }
    public bool Survival { get; set; }
    public int GameId { get; set; }
    public Game Game { get; set; }
}
