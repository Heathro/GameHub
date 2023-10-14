namespace API.DTOs;

public class TitleDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Poster { get; set; }
    public List<ScreenshotDto> Screenshots { get; set; }
}
