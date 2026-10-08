namespace TourFlow.Domain.Entities;

public class BlogPost
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "Travel Guide";
    public string Division { get; set; } = "All";
    public string AuthorName { get; set; } = "Anonymous Traveler";
    public string AuthorEmail { get; set; } = string.Empty;
    public string? AuthorAvatar { get; set; }
    public string CoverImageUrl { get; set; } = string.Empty;
    public int Upvotes { get; set; } = 0;
    public int Views { get; set; } = 0;
    public bool IsPinned { get; set; } = false;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<BlogComment> Comments { get; set; } = new List<BlogComment>();
}
