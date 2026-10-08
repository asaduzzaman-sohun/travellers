namespace TourFlow.Domain.Entities;

public class BlogComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BlogPostId { get; set; }
    public BlogPost? BlogPost { get; set; }
    public string AuthorName { get; set; } = "Traveler";
    public string AuthorEmail { get; set; } = string.Empty;
    public string? AuthorAvatar { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
