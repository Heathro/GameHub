using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data.Seeding;

public class Seed
{
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

        foreach (var user in users)
        {
            await userManager.CreateAsync(user, "Pa$$w0rd");
            await userManager.AddToRoleAsync(user, "Player");
        }

        var admin = new AppUser
        { 
            UserName = "Admin",
            Avatar = new Avatar(),
            Realname = "",
            Summary = "",
            Country = "",
            City = "",
            Created = DateTime.UtcNow
        };
        await userManager.CreateAsync(admin, "Pa$$w0rd");
        await userManager.AddToRolesAsync(admin, new[]{"Admin", "Moderator"});
    }

    public static async Task SeedGames(DataContext context)
    {
        if (await context.Games.AnyAsync()) return;

        var options = new JsonSerializerOptions{PropertyNameCaseInsensitive = true};

        var gameData = await File.ReadAllTextAsync("Data/Seeding/GameSeedData.json");

        var games = JsonSerializer.Deserialize<List<Game>>(gameData, options);

        foreach (var game in games) context.Games.Add(game);

        await context.SaveChangesAsync();
    }
}
