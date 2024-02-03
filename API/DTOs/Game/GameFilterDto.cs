namespace API.DTOs;

public class GameFilterDto
{
    public CategoriesDto Categories { get; set; }
    public PlatformsDto Platforms { get; set; }
    public GenresDto Genres { get; set; }
}
