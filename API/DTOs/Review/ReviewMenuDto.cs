namespace API.DTOs;

public class ReviewMenuDto
{
    public int Id { get; set; }
    public bool Posted { get; set; }
    public int GameId { get; set; }
    public string GameTitle { get; set; }
    public PlatformsDto GamePlatforms { get; set; }
    public PosterDto GamePoster { get; set; }
    public string Content { get; set; }
}
