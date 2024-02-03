using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Screenshots")]
public class Screenshot
{
    public int Id { get; set; }
    public string Url { get; set; }
    public string PublicId { get; set; }
    public int GameId { get; set; }
    public Game Game { get; set; }
}
