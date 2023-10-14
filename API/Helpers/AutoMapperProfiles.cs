﻿using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>();

        CreateMap<Game, TitleDto>()
            .ForMember(dest => dest.Poster, 
                opt => opt.MapFrom(src => src.Screenshots.FirstOrDefault(s => s.IsMain).Url));
        
        CreateMap<Screenshot, ScreenshotDto>();
    }
}