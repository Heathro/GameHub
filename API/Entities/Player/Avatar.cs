using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Avatars")]
public class Avatar
{
    public int Id { get; set; }
    public string Url { get; set; }
    public string PublicId { get; set; }
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; }
}
