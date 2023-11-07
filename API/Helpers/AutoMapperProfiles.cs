using AutoMapper;
using API.DTOs;
using API.Entities;
using API.Extensions;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>();
        CreateMap<PlayerEditDto, AppUser>();

        CreateMap<RegisterDto, AppUser>();

        CreateMap<Avatar, AvatarDto>();

        CreateMap<Game, GameDto>()
            .ForMember(d => d.Likes, o => o.MapFrom(s => s.GetLikedUsers()));
        CreateMap<GameEditDto, Game>();

        CreateMap<Platforms, PlatformsDto>();
        CreateMap<PlatformsDto, Platforms>();

        CreateMap<Genres, GenresDto>();
        CreateMap<GenresDto, Genres>();

        CreateMap<Poster, PosterDto>();
        CreateMap<Screenshot, ScreenshotDto>();

        CreateMap<Message, MessageDto>()
            .ForMember(d => d.SenderAvatar, o => o.MapFrom(s => s.Sender.Avatar))
            .ForMember(d => d.RecipientAvatar, o => o.MapFrom(s => s.Recipient.Avatar));
    }
}
