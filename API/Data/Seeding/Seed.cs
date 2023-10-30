using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data.Seeding;

public class Seed
{
    public static async Task SeedUsers(DataContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var options = new JsonSerializerOptions{PropertyNameCaseInsensitive = true};

        var userData = await File.ReadAllTextAsync("Data/Seeding/UserSeedData.json");

        var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);

        foreach (var user in users)
        {
            using var hmac = new HMACSHA512();

            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
            user.PasswordSalt = hmac.Key;

            context.Users.Add(user);
        }

        await context.SaveChangesAsync();
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
