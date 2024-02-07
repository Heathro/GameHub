using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Files")]
public class Files
{
    public int Id { get; set; }
    public string WindowsName { get; set; }
    public long WindowsSize { get; set; }
    public string MacosName { get; set; }
    public long MacosSize { get; set; }
    public string LinuxName { get; set; }
    public long LinuxSize { get; set; }
    public int GameId { get; set; }
    public Game Game { get; set; }
}