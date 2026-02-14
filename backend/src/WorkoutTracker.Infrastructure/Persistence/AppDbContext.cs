using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Infrastructure.Identity;

namespace WorkoutTracker.Infrastructure.Persistence;

public sealed class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Workout> Workouts => Set<Workout>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Workout>(b =>
    {
        b.ToTable("workouts");

        b.HasKey(x => x.Id);

        b.Property(x => x.Id)
            .HasColumnName("id");

        b.Property(x => x.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        b.Property(x => x.Type)
            .HasColumnName("type");

        b.Property(x => x.StartedAt)
  .HasColumnName("started_at")
  .HasColumnType("date"); 

        b.Property(x => x.Duration)
            .HasColumnName("duration");

        b.Property(x => x.Intensity)
            .HasColumnName("intensity");

        b.Property(x => x.Fatigue)
            .HasColumnName("fatigue");

        b.Property(x => x.CaloriesBurned)
            .HasColumnName("calories_burned");

        b.Property(x => x.Notes)
            .HasColumnName("notes")
            .HasMaxLength(2000);

        b.HasOne<ApplicationUser>()
         .WithMany()
         .HasForeignKey(x => x.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => new { x.UserId, x.StartedAt });
    });
}

}
