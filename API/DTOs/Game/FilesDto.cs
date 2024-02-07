namespace API.DTOs;

public class FilesDto
{
    public string WindowsName { get; set; }
    public long WindowsSize { get; set; }
    public string MacosName { get; set; }
    public long MacosSize { get; set; }
    public string LinuxName { get; set; }
    public long LinuxSize { get; set; }
}