using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>();
        CreateMap<PlayerEditDto, AppUser>();
        CreateMap<RegisterDto, AppUser>();

        CreateMap<Avatar, AvatarDto>();

        CreateMap<Game, GameDto>().ForMember(d => d.Likes, o => o.MapFrom(s => s.LikedUsers.Count));
        CreateMap<GameEditDto, Game>();

        CreateMap<Platforms, PlatformsDto>();
        CreateMap<PlatformsDto, Platforms>();

        CreateMap<Genres, GenresDto>();
        CreateMap<GenresDto, Genres>();
        
        CreateMap<Poster, PosterDto>();
        CreateMap<Screenshot, ScreenshotDto>();
    }
}
