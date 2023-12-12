namespace API.DTOs;

public class ReviewMenuDto
{
    public int Id { get; set; }
    public bool Posted { get; set; }
    public GameDto Game { get; set; }
    public string Content { get; set; }
}
