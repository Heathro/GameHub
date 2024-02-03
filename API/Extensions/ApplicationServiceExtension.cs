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
        services.AddCors();

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IImageService, ImageService>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSignalR();
        services.AddSingleton<PresenceTracker>();
        services.AddScoped<INotificationCenter, NotificationCenter>();
        
        services.AddScoped<LogUserActivity>();

        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

        return services;
    }
}
