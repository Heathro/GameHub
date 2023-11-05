namespace API.Entities;

public class Like
{
    public AppUser SourceUser { get; set; }
    public int SourceUserId { get; set; }
    public Game TargetGame { get; set; }
    public int TargetGameId { get; set; }
}
