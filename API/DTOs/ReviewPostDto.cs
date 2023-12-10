namespace API.DTOs;

public class ReviewPostDto
{
    public bool Posted { get; set; }
    public GameDto Game { get; set; }
    public string Content { get; set; }
}
