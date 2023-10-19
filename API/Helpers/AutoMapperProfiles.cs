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

        CreateMap<Game, GameDto>();
        CreateMap<GameEditDto, Game>();
        
        CreateMap<Screenshot, ScreenshotDto>();

        CreateMap<Avatar, AvatarDto>();

        CreateMap<Poster, PosterDto>();
    }
}
