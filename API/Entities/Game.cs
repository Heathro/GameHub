namespace API.Entities;

public class Game
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public Platforms Platforms { get; set; }
    public Genres Genres { get; set; }
    public Poster Poster { get; set; }
    public Publication Publication { get; set; }    
    public List<Bookmark> Bookmarks { get; set; } = new();
    public List<Screenshot> Screenshots { get; set; } = new();
    public List<Like> LikedUsers { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public DateTime Release { get; set; } = DateTime.UtcNow;
}
