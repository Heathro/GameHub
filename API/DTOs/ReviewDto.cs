namespace API.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewerUsername { get; set; }
    public AvatarDto ReviewerAvatar { get; set; }
    public int GameId { get; set; }
    public string GameTitle { get; set; }
    public PosterDto GamePoster { get; set; }
    public string Content { get; set; }
    public DateTime ReviewPosted { get; set; } = DateTime.UtcNow;
}
