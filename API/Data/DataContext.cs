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
    public DataContext(DbContextOptions options) : base(options) { }

    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Bookmark> Bookmarks { get; set; }
    public DbSet<Publication> Publications { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>()
            .HasMany(u => u.UserRoles)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .IsRequired();

        modelBuilder.Entity<AppRole>()
            .HasMany(r => r.UserRoles)
            .WithOne(ur => ur.Role)
            .HasForeignKey(ur => ur.RoleId)
            .IsRequired();

        modelBuilder.Entity<Friendship>()
            .HasKey(f => new {f.InviterId, f.InviteeId, f.Status});
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Inviter)
            .WithMany(u => u.Invitees)
            .HasForeignKey(f => f.InviterId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Invitee)
            .WithMany(u => u.Inviters)
            .HasForeignKey(f => f.InviteeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Recipient)
            .WithMany(u => u.MessagesReceived)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Publication>()
            .HasKey(p => new {p.PublisherId, p.TitleId});
        modelBuilder.Entity<Publication>()
            .HasOne(p => p.Publisher)
            .WithMany(u => u.Publications)
            .HasForeignKey(p => p.PublisherId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Publication>()
            .HasOne(p => p.Title)
            .WithOne(g => g.Publication)
            .HasForeignKey<Publication>(p => p.TitleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Bookmark>()
            .HasKey(b => new {b.SourceUserId, b.TargetGameId});
        modelBuilder.Entity<Bookmark>()
            .HasOne(b => b.SourceUser)
            .WithMany(u => u.Bookmarks)
            .HasForeignKey(b => b.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Bookmark>()
            .HasOne(b => b.TargetGame)
            .WithMany(g => g.Bookmarks)
            .HasForeignKey(b => b.TargetGameId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Like>()
            .HasKey(l => new {l.SourceUserId, l.TargetGameId});
        modelBuilder.Entity<Like>()
            .HasOne(l => l.SourceUser)
            .WithMany(u => u.LikedGames)
            .HasForeignKey(l => l.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Like>()
            .HasOne(l => l.TargetGame)
            .WithMany(g => g.LikedUsers)
            .HasForeignKey(l => l.TargetGameId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Reviewer)
            .WithMany(u => u.Reviews)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Game)
            .WithMany(g => g.Reviews)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Review>()
            .HasQueryFilter(r => r.IsApproved);
    }
}
