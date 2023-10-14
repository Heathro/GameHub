namespace API.Entities;

public class Game
{
    public int Id { get; set; }
    public string Title { get; set; }
    public List<Screenshot> Screenshots { get; set; } = new();
}
