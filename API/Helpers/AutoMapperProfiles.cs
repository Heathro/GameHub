using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>()
            .ForMember(d => d.Publications, o => o.MapFrom(s => s.Publications.Select(p => p.Title)));
        CreateMap<PlayerEditDto, AppUser>();
        CreateMap<RegisterDto, AppUser>();
        
        CreateMap<Avatar, AvatarDto>();

        CreateMap<Game, GameDto>()
            .ForMember(d => d.Likes, o => o.MapFrom(s => s.LikedUsers.Select(l => l.SourceUserId)))
            .ForMember(d => d.Publisher, o => o.MapFrom(s => s.Publication.Publisher.UserName));
        CreateMap<GameEditDto, Game>();
        CreateMap<GamePublishDto, Game>();

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
