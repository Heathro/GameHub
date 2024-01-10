using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Interfaces;
using API.Services;
using API.Helpers;
using API.SignalR;

namespace API.Extensions;

public static class ApplicationServiceExtension
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, 
        IConfiguration config)
    {
        services.AddDbContext<DataContext>(options =>
        {
            options.UseSqlite(config.GetConnectionString("DefaultConnection"));
        });

        services.AddCors();

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IImageService, ImageService>();

        services.AddScoped<IUsersRepository, UsersRepository>();
        services.AddScoped<IGamesRepository, GamesRepository>();
        services.AddScoped<ILikesRepository, LikesRepository>();
        services.AddScoped<IMessagesRepository, MessagesRepository>();
        services.AddScoped<IFriendsRepository, FriendsRepository>();
        services.AddScoped<IBookmarksRepository, BookmarksRepository>();
        services.AddScoped<IReviewsRepository, ReviewsRepository>();

        services.AddSignalR();
        services.AddSingleton<PresenceTracker>();
        services.AddScoped<LogUserActivity>();

        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

        return services;
    }
}
