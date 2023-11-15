using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using API.Entities;
using Microsoft.AspNetCore.Identity;

namespace API.Data.Seeding;

public class Seed
{
    public static async Task SeedUsers(UserManager<AppUser> userManager)
    {
        if (await userManager.Users.AnyAsync()) return;

        var options = new JsonSerializerOptions{PropertyNameCaseInsensitive = true};

        var userData = await File.ReadAllTextAsync("Data/Seeding/UserSeedData.json");

        var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);

        foreach (var user in users)
        {
            await userManager.CreateAsync(user, "Pa$$w0rd");
        }
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
