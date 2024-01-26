using AutoMapper;
using API.DTOs;
using API.Entities;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser, PlayerDto>()
            .ForMember(d => d.Publications, o => o.MapFrom(
                s => s.Publications.Select(p => p.Title).OrderByDescending(p => p.Release)
            ));
        CreateMap<PlayerEditDto, AppUser>();
        CreateMap<RegisterDto, AppUser>();
        CreateMap<AppUser, UserRoleDto>()
            .ForMember(d => d.AvatarUrl, o => o.MapFrom(s => s.Avatar.Url))
            .ForMember(d => d.Roles, o => o.MapFrom(s => s.UserRoles.Select(r => r.Role.Name).ToList()));
        
        CreateMap<Avatar, AvatarDto>();

        CreateMap<Game, GameDto>()
            .ForMember(d => d.Bookmarks, o => o.MapFrom(s => s.Bookmarks.Select(b => b.SourceUserId)))
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

        CreateMap<Review, ReviewDto>()
            .ForMember(d => d.ReviewerAvatar, o => o.MapFrom(s => s.Reviewer.Avatar))
            .ForMember(d => d.GamePoster, o => o.MapFrom(s => s.Game.Poster));

        CreateMap<Review, ReviewModerationDto>()
            .ForMember(d => d.ReviewerAvatar, o => o.MapFrom(s => s.Reviewer.Avatar))
            .ForMember(d => d.GamePoster, o => o.MapFrom(s => s.Game.Poster));

        CreateMap<DateTime, DateTime>()
            .ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
        CreateMap<DateTime?, DateTime?>()
            .ConvertUsing(d => d.HasValue ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : null);
    }
}
