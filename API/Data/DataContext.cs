using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using API.Entities;

namespace API.Data;

public class DataContext : IdentityDbContext
<
    AppUser, 
    AppRole, 
    int, 
    IdentityUserClaim<int>, 
    AppUserRole, 
    IdentityUserLogin<int>, 
    IdentityRoleClaim<int>, 
    IdentityUserToken<int>
>
{
    public DataContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>()
            .HasMany(u => u.UserRoles)
            .WithOne(u => u.User)
            .HasForeignKey(u => u.UserId)
            .IsRequired();

        modelBuilder.Entity<AppRole>()
            .HasMany(r => r.UserRoles)
            .WithOne(r => r.Role)
            .HasForeignKey(r => r.RoleId)
            .IsRequired();

        modelBuilder.Entity<Like>()
            .HasKey(l => new {l.SourceUserId, l.TargetGameId});
        modelBuilder.Entity<Like>()
            .HasOne(l => l.SourceUser)
            .WithMany(l => l.LikedGames)
            .HasForeignKey(l => l.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Like>()
            .HasOne(l => l.TargetGame)
            .WithMany(l => l.LikedUsers)
            .HasForeignKey(l => l.TargetGameId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Friendship>()
            .HasKey(f => new {f.InviterId, f.InviteeId, f.Status});
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Inviter)
            .WithMany(f => f.Invitees)
            .HasForeignKey(f => f.InviterId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Invitee)
            .WithMany(f => f.Inviters)
            .HasForeignKey(f => f.InviteeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Recipient)
            .WithMany(m => m.MessagesReceived)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(m => m.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
