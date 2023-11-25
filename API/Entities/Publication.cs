namespace API.Entities;

public class Publication
{
    public AppUser Publisher { get; set; }
    public int PublisherId { get; set; }
    public Game Title { get; set; }
    public int TitleId { get; set; }
}
