using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>()
            .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => src.Avatar.Url));

        CreateMap<PlayerEditDto, AppUser>();

        CreateMap<Game, GameDto>()
            .ForMember(dest => dest.Poster, opt => opt.MapFrom(src => src.Poster.Url));
        
        CreateMap<Screenshot, ScreenshotDto>();
    }
}
