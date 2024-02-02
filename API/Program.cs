using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Data.Seeding;
using API.Entities;
using API.Extensions;
using API.Middleware;
using API.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors
(
    builder => builder
        .AllowCredentials()
        .AllowAnyHeader()
        .AllowAnyMethod()
        .WithOrigins("https://localhost:4200")
);

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

app.MapHub<PresenceHub>("hubs/presence");
app.MapHub<MessageHub>("hubs/message");

app.MapFallbackToController("Index", "Fallback");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<DataContext>();

    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();

    await context.Database.MigrateAsync();
    await context.Database.ExecuteSqlRawAsync("DELETE FROM [Connections]");

    await Seed.SeedUsers(userManager, roleManager);
    await Seed.SeedGames(context);
}
catch (Exception ex)
{
    var logger = services.GetService<Logger<Program>>();
    logger.LogError(ex, "An error occured during migration");
}

app.Run();