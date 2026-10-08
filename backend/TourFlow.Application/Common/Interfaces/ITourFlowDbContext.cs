using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;

namespace TourFlow.Application.Common.Interfaces;

public interface ITourFlowDbContext
{
    DbSet<TourPackage> TourPackages { get; }
    DbSet<ItineraryDay> ItineraryDays { get; }
    DbSet<TourSchedule> TourSchedules { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<Traveler> Travelers { get; }
    DbSet<Review> Reviews { get; }
    DbSet<User> Users { get; }
    DbSet<BlogPost> BlogPosts { get; }
    DbSet<BlogComment> BlogComments { get; }
    DbSet<Hotel> Hotels { get; }
    DbSet<TravelTip> TravelTips { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
