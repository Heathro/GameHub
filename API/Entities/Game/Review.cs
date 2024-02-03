namespace API.Entities;

public class Review
{
    public int Id { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewerUsername { get; set; }
    public AppUser Reviewer { get; set; }
    public int GameId { get; set; }
    public string GameTitle { get; set; }
    public Game Game { get; set; }
    public string Content { get; set; }
    public DateTime ReviewPosted { get; set; } = DateTime.UtcNow;
    public bool IsApproved { get; set; }
}