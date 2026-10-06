using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;

namespace TourFlow.Infrastructure.Data;

public class TourFlowDbContext : DbContext
{
    public TourFlowDbContext(DbContextOptions<TourFlowDbContext> options) : base(options)
    {
    }

    public DbSet<TourPackage> TourPackages => Set<TourPackage>();
    public DbSet<ItineraryDay> ItineraryDays => Set<ItineraryDay>();
    public DbSet<TourSchedule> TourSchedules => Set<TourSchedule>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Traveler> Travelers => Set<Traveler>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TourPackage
        modelBuilder.Entity<TourPackage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(220).IsRequired();
            entity.Property(e => e.Destination).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Country).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Region).HasMaxLength(100);
            entity.Property(e => e.StartCity).HasMaxLength(100);
            entity.Property(e => e.EndCity).HasMaxLength(100);
            entity.Property(e => e.IdealSeason).HasMaxLength(100);
            entity.Property(e => e.BasePrice).HasPrecision(18, 2);
            entity.Property(e => e.DiscountPrice).HasPrecision(18, 2);
            entity.Property(e => e.DepositAmount).HasPrecision(18, 2);

            entity.HasMany(e => e.ItineraryDays)
                .WithOne(e => e.TourPackage)
                .HasForeignKey(e => e.TourPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Schedules)
                .WithOne(e => e.TourPackage)
                .HasForeignKey(e => e.TourPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Reviews)
                .WithOne(e => e.TourPackage)
                .HasForeignKey(e => e.TourPackageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TourSchedule
        modelBuilder.Entity<TourSchedule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PricePerPerson).HasPrecision(18, 2);

            entity.HasMany(e => e.Bookings)
                .WithOne(e => e.TourSchedule)
                .HasForeignKey(e => e.TourScheduleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.BookingReference).IsUnique();
            entity.Property(e => e.BookingReference).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CustomerName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.CustomerEmail).HasMaxLength(150).IsRequired();
            entity.Property(e => e.CustomerPhone).HasMaxLength(50);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.DepositPaid).HasPrecision(18, 2);
            entity.Property(e => e.BalanceRemaining).HasPrecision(18, 2);

            entity.HasMany(e => e.Travelers)
                .WithOne(e => e.Booking)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Traveler
        modelBuilder.Entity<Traveler>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
        });

        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReviewerName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.ReviewerLocation).HasMaxLength(150);
            entity.Property(e => e.ReviewerEmail).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.TripDateFormatted).HasMaxLength(100);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.Property(e => e.PasswordHash).HasMaxLength(256).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PhoneNumber).HasMaxLength(50);
            entity.Property(e => e.HomeCity).HasMaxLength(100);
            entity.Property(e => e.NidOrPassport).HasMaxLength(100);
        });
    }
}
