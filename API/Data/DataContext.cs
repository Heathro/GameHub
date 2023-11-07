using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<AppUser> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Like>()
            .HasKey(k => new {k.SourceUserId, k.TargetGameId});
        modelBuilder.Entity<Like>()
            .HasOne(s => s.SourceUser)
            .WithMany(l => l.LikedGames)
            .HasForeignKey(s => s.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Like>()
            .HasOne(t => t.TargetGame)
            .WithMany(l => l.LikedUsers)
            .HasForeignKey(t => t.TargetGameId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(u => u.Recipient)
            .WithMany(m => m.MessagesReceived)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Message>()
            .HasOne(u => u.Sender)
            .WithMany(m => m.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
