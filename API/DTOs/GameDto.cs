namespace API.DTOs;

public class GameDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public PosterDto Poster { get; set; }
    public string Description { get; set; }
    public List<ScreenshotDto> Screenshots { get; set; }
}
