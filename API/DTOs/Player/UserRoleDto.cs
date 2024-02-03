namespace API.DTOs;

public class UserRoleDto
{
    public int Id { get; set; }
    public string UserName { get; set; }
    public string AvatarUrl { get; set; }
    public List<string> Roles { get; set; }
}
