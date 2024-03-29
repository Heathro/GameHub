﻿namespace API.DTOs;

public class GameDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public PlatformsDto Platforms { get; set; }
    public GenresDto Genres { get; set; }
    public PosterDto Poster { get; set; }
    public string Publisher { get; set; }
    public FilesDto Files { get; set; }
    public List<int> Bookmarks { get; set; }
    public List<ScreenshotDto> Screenshots { get; set; }
    public List<int> Likes { get; set; }    
    public DateTime Release { get; set; }
    public string Video { get; set; }
}
