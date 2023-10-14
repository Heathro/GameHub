using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>();

        CreateMap<Game, TitleDto>();
        
        CreateMap<Screenshot, ScreenshotDto>();
    }
}
