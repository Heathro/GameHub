using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data.Seeding;

public class Seed
{
    public static async Task ClearConnections(DataContext context)
    {
        context.Connections.RemoveRange(context.Connections);
        await context.SaveChangesAsync();
    }

    public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        var options = new JsonSerializerOptions{PropertyNameCaseInsensitive = true};
        var userData = await File.ReadAllTextAsync("Data/Seeding/UserSeedData.json");
        var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);

        var roles = new List<AppRole>
        {
            new AppRole{ Name = "Admin" },
            new AppRole{ Name = "Moderator" },
            new AppRole{ Name = "Player" }
        };
        foreach (var role in roles)
        {
            await roleManager.CreateAsync(role);
        }

        var admin = new AppUser
        { 
            UserName = "Admin",
            Avatar = new Avatar(),
            Realname = string.Empty,
            Summary = string.Empty,
            Country = string.Empty,
            City = string.Empty,
            Created = DateTime.UtcNow
        };
        await userManager.CreateAsync(admin, Environment.GetEnvironmentVariable("ADMIN_PASSWORD"));
        await userManager.AddToRolesAsync(admin, new[]{"Admin", "Moderator"});

        foreach (var user in users)
        {
            user.Created = DateTime.SpecifyKind(user.Created, DateTimeKind.Utc);
            user.LastActive = DateTime.SpecifyKind(user.LastActive, DateTimeKind.Utc);

            await userManager.CreateAsync(user, "Pa$$w0rd");
            await userManager.AddToRoleAsync(user, "Player");
        }
    }

    public static async Task SeedGames(DataContext context)
    {
        if (await context.Games.AnyAsync()) return;

        var options = new JsonSerializerOptions{PropertyNameCaseInsensitive = true};

        var gameData = await File.ReadAllTextAsync("Data/Seeding/GameSeedData.json");

        var games = JsonSerializer.Deserialize<List<Game>>(gameData, options);

        foreach (var game in games) 
        {
            game.Publication = new Publication
            {
                PublisherId = 2
            };
            game.Files = new Files
            {
                WindowsName = string.Empty,
                WindowsSize = 0,
                MacosName = string.Empty,
                MacosSize = 0,
                LinuxName = string.Empty,
                LinuxSize = 0
            };
            context.Games.Add(game);
        }

        await context.SaveChangesAsync();
    }
}
