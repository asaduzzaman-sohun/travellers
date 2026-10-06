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
            entity.Property(e => e.BasePrice).HasPrecision(18, 2);
            entity.Property(e => e.DiscountPrice).HasPrecision(18, 2);

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
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

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
            entity.Property(e => e.ReviewerEmail).HasMaxLength(150).IsRequired();
        });
    }
}
