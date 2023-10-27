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

        context.Games.Add(new Game
        {
            Id = 1,
            Title = "Lost",
            Description = "2D-pixel art",
            Platforms = new Platforms
            {
                Windows = true,
                Macos = true,
                Linux = true
            },
            Genres = new Genres
            {
                Action = false,
                Adventure = true,
                Card = false,
                Educational = false,
                Fighting = false,
                Horror = false,
                Platformer = true,
                Puzzle = false,
                Racing = false,
                Rhythm = false,
                Roleplay = false,
                Shooter = false,
                Simulation = false,
                Sport = false,
                Stealth = false,
                Strategy = false,
                Survival = false
            },
            Poster = new Poster
            {
                Url = "https://img.itch.zone/aW1hZ2UvODEwMTE2LzQ1NDE1MjYucG5n/original/zA28rq.png"
            },
            Screenshots =
            {
                new Screenshot
                {
                    Url = "https://img.itch.zone/aW1hZ2UvODEwMTE2LzQ1NDE1MjYucG5n/original/zA28rq.png"
                }
            }
        });

        context.Games.Add(new Game
        {
            Id = 2,
            Title = "Dungeon",
            Description = "Turn-based",
            Platforms = new Platforms
            {
                Windows = true,
                Macos = true,
                Linux = false
            },
            Genres = new Genres
            {
                Action = false,
                Adventure = true,
                Card = false,
                Educational = false,
                Fighting = false,
                Horror = false,
                Platformer = false,
                Puzzle = false,
                Racing = false,
                Rhythm = false,
                Roleplay = true,
                Shooter = false,
                Simulation = false,
                Sport = false,
                Stealth = false,
                Strategy = false,
                Survival = false
            },
            Poster = new Poster
            {
                Url = "https://img.itch.zone/aW1hZ2UvMTg3NjUxMS8xMTAyMzM5Ni5wbmc=/original/Wy0mql.png"
            },
            Screenshots =
            {
                new Screenshot
                {
                    Url = "https://img.itch.zone/aW1hZ2UvMTg3NjUxMS8xMTAyMzM5Ni5wbmc=/original/Wy0mql.png"
                }
            }
        });

        await context.SaveChangesAsync();
    }
}
