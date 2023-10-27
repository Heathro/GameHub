namespace API.Entities;

public class Game
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public Platforms Platforms { get; set; }
    public Genres Genres { get; set; }
    public Poster Poster { get; set; }
    public List<Screenshot> Screenshots { get; set; } = new();
}
