using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Interfaces;
using API.Services;
using API.Helpers;

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
        services.AddScoped<IUsersRepository, UsersRepository>();
        services.AddScoped<IGamesRepository, GamesRepository>();
        services.AddScoped<ILikesRepository, LikesRepository>();
        services.AddScoped<IMessagesRepository, MessagesRepository>();
        services.AddScoped<IFriendsRepository, FriendsRepository>();
        services.AddScoped<IImageService, ImageService>();
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
        services.AddScoped<LogUserActivity>();

        return services;
    }
}
