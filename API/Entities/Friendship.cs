namespace API.Entities;

public class Friendship
{
    public AppUser Inviter { get; set; }
    public int InviterId { get; set; }
    public AppUser Invitee { get; set; }
    public int InviteeId { get; set; }
    public int Status { get; set; }
}
