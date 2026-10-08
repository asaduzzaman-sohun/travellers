using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourFlow.Domain.Entities;
using TourFlow.Infrastructure.Data;

namespace TourFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogPostsController : ControllerBase
{
    private readonly TourFlowDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly TourFlow.Application.Common.Interfaces.IPhotoService _photoService;

    public BlogPostsController(
        TourFlowDbContext context,
        IWebHostEnvironment environment,
        TourFlow.Application.Common.Interfaces.IPhotoService photoService)
    {
        _context = context;
        _environment = environment;
        _photoService = photoService;
    }

    // GET /api/blogposts
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] string? division = null,
        [FromQuery] string? search = null)
    {
        var query = _context.BlogPosts
            .Include(p => p.Comments)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(p => p.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(division) && division != "All")
        {
            query = query.Where(p => p.Division.ToLower() == division.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(s) ||
                                     p.Summary.ToLower().Contains(s) ||
                                     p.AuthorName.ToLower().Contains(s) ||
                                     p.Content.ToLower().Contains(s));
        }

        var posts = await query
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAtUtc)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Slug,
                p.Summary,
                p.Category,
                p.Division,
                p.AuthorName,
                p.AuthorEmail,
                p.AuthorAvatar,
                p.CoverImageUrl,
                p.Upvotes,
                p.Views,
                p.IsPinned,
                p.CreatedAtUtc,
                p.UpdatedAtUtc,
                CommentCount = p.Comments.Count
            })
            .ToListAsync();

        return Ok(posts);
    }

    // GET /api/blogposts/{idOrSlug}
    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetByIdOrSlug(string idOrSlug)
    {
        BlogPost? post = null;

        if (Guid.TryParse(idOrSlug, out var id))
        {
            post = await _context.BlogPosts
                .Include(p => p.Comments.OrderBy(c => c.CreatedAtUtc))
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        if (post == null)
        {
            post = await _context.BlogPosts
                .Include(p => p.Comments.OrderBy(c => c.CreatedAtUtc))
                .FirstOrDefaultAsync(p => p.Slug.ToLower() == idOrSlug.ToLower());
        }

        if (post == null)
        {
            return NotFound(new { message = $"Travel story '{idOrSlug}' not found." });
        }

        // Increment view count
        post.Views++;
        await _context.SaveChangesAsync();

        return Ok(post);
    }

    // POST /api/blogposts
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogPostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { message = "Title and Content are required." });
        }

        var authorEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var authorName = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(authorName))
        {
            authorName = request.AuthorName?.Trim() ?? "Traveler";
        }

        var slug = GenerateSlug(request.Title);
        var originalSlug = slug;
        int count = 1;
        while (await _context.BlogPosts.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{originalSlug}-{count++}";
        }

        var summary = !string.IsNullOrWhiteSpace(request.Summary)
            ? request.Summary
            : (request.Content.Length > 160 ? request.Content.Substring(0, 157) + "..." : request.Content);

        var coverImage = !string.IsNullOrWhiteSpace(request.CoverImageUrl)
            ? request.CoverImageUrl
            : "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80";

        var post = new BlogPost
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Slug = slug,
            Summary = summary.Trim(),
            Content = request.Content.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "Travel Guide" : request.Category.Trim(),
            Division = string.IsNullOrWhiteSpace(request.Division) ? "Chattogram" : request.Division.Trim(),
            AuthorName = authorName,
            AuthorEmail = authorEmail,
            AuthorAvatar = request.AuthorAvatar,
            CoverImageUrl = coverImage.Trim(),
            Upvotes = 0,
            Views = 1,
            IsPinned = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByIdOrSlug), new { idOrSlug = post.Id }, post);
    }

    // PUT /api/blogposts/{id}
    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBlogPostRequest request)
    {
        var post = await _context.BlogPosts.FindAsync(id);
        if (post == null)
        {
            return NotFound(new { message = "Post not found." });
        }

        var callerEmail = User.FindFirstValue(ClaimTypes.Email);
        var callerRole = User.FindFirstValue(ClaimTypes.Role);
        bool isOwner = !string.IsNullOrEmpty(callerEmail) && post.AuthorEmail.Equals(callerEmail, StringComparison.OrdinalIgnoreCase);
        bool isAdmin = callerRole == "Admin" || callerRole == "SuperAdmin";

        if (!isOwner && !isAdmin)
        {
            return Forbid();
        }

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            post.Title = request.Title.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Content))
        {
            post.Content = request.Content.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Summary))
        {
            post.Summary = request.Summary.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            post.Category = request.Category.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Division))
        {
            post.Division = request.Division.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.CoverImageUrl))
        {
            post.CoverImageUrl = request.CoverImageUrl.Trim();
        }

        post.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(post);
    }

    // DELETE /api/blogposts/{id}
    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var post = await _context.BlogPosts.FindAsync(id);
        if (post == null)
        {
            return NotFound(new { message = "Post not found." });
        }

        var callerEmail = User.FindFirstValue(ClaimTypes.Email);
        var callerRole = User.FindFirstValue(ClaimTypes.Role);
        bool isOwner = !string.IsNullOrEmpty(callerEmail) && post.AuthorEmail.Equals(callerEmail, StringComparison.OrdinalIgnoreCase);
        bool isAdmin = callerRole == "Admin" || callerRole == "SuperAdmin";

        if (!isOwner && !isAdmin)
        {
            return Forbid();
        }

        _context.BlogPosts.Remove(post);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Post deleted successfully." });
    }

    // POST /api/blogposts/{id}/upvote
    [HttpPost("{id:guid}/upvote")]
    public async Task<IActionResult> Upvote(Guid id)
    {
        var post = await _context.BlogPosts.FindAsync(id);
        if (post == null)
        {
            return NotFound(new { message = "Post not found." });
        }

        post.Upvotes++;
        await _context.SaveChangesAsync();

        return Ok(new { id = post.Id, upvotes = post.Upvotes });
    }

    // POST /api/blogposts/{id}/comments
    [Authorize]
    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { message = "Comment content cannot be empty." });
        }

        var post = await _context.BlogPosts.FindAsync(id);
        if (post == null)
        {
            return NotFound(new { message = "Post not found." });
        }

        var authorEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var authorName = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(authorName))
        {
            authorName = request.AuthorName?.Trim() ?? "Fellow Traveler";
        }

        var comment = new BlogComment
        {
            Id = Guid.NewGuid(),
            BlogPostId = id,
            AuthorName = authorName,
            AuthorEmail = authorEmail,
            AuthorAvatar = request.AuthorAvatar,
            Content = request.Content.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.BlogComments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    // DELETE /api/blogposts/{id}/comments/{commentId}
    [Authorize]
    [HttpDelete("{id:guid}/comments/{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(Guid id, Guid commentId)
    {
        var comment = await _context.BlogComments
            .Include(c => c.BlogPost)
            .FirstOrDefaultAsync(c => c.Id == commentId && c.BlogPostId == id);

        if (comment == null)
        {
            return NotFound(new { message = "Comment not found." });
        }

        var callerEmail = User.FindFirstValue(ClaimTypes.Email);
        var callerRole = User.FindFirstValue(ClaimTypes.Role);
        bool isCommentOwner = !string.IsNullOrEmpty(callerEmail) && comment.AuthorEmail.Equals(callerEmail, StringComparison.OrdinalIgnoreCase);
        bool isPostOwner = comment.BlogPost != null && !string.IsNullOrEmpty(callerEmail) && comment.BlogPost.AuthorEmail.Equals(callerEmail, StringComparison.OrdinalIgnoreCase);
        bool isAdmin = callerRole == "Admin" || callerRole == "SuperAdmin";

        if (!isCommentOwner && !isPostOwner && !isAdmin)
        {
            return Forbid();
        }

        _context.BlogComments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Comment removed." });
    }

    // POST /api/blogposts/upload-image
    [Authorize]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No image file provided." });
        }

        // Limit size to 10MB
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest(new { message = "Image size exceeds 10MB limit." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Unsupported image format. Allowed: jpg, jpeg, png, webp, gif." });
        }

        // Verify magic bytes (file signature)
        using (var streamCheck = file.OpenReadStream())
        {
            var headerBytes = new byte[8];
            var bytesRead = await streamCheck.ReadAsync(headerBytes, 0, 8);
            if (bytesRead < 4 || !IsValidImageHeader(headerBytes))
            {
                return BadRequest(new { message = "Invalid file signature. Uploaded file is not a valid image." });
            }
        }

        // If Cloudinary is configured, upload directly to Cloudinary CDN
        if (_photoService.IsConfigured)
        {
            using (var stream = file.OpenReadStream())
            {
                var photoResult = await _photoService.UploadPhotoAsync(stream, file.FileName, "tourflow/uploads");
                if (photoResult.IsSuccess && !string.IsNullOrWhiteSpace(photoResult.Url))
                {
                    return Ok(new
                    {
                        url = photoResult.Url,
                        relativeUrl = photoResult.Url,
                        publicId = photoResult.PublicId,
                        provider = "Cloudinary"
                    });
                }
            }
        }

        // Fallback to local disk storage
        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var uploadsFolder = Path.Combine(webRoot, "uploads");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var safeFileName = $"story_{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var requestBase = $"{Request.Scheme}://{Request.Host}";
        var relativeUrl = $"/uploads/{safeFileName}";
        var absoluteUrl = $"{requestBase}{relativeUrl}";

        return Ok(new { url = absoluteUrl, relativeUrl });
    }

    private static bool IsValidImageHeader(byte[] bytes)
    {
        // JPEG: FF D8 FF
        if (bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            return true;

        // PNG: 89 50 4E 47
        if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
            return true;

        // GIF: 47 49 46 38 ("GIF8")
        if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x38)
            return true;

        // WEBP / RIFF: 52 49 46 46 ("RIFF")
        if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46)
            return true;

        return false;
    }

    private static string GenerateSlug(string phrase)
    {
        string str = phrase.ToLowerInvariant();
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
        str = Regex.Replace(str, @"\s+", " ").Trim();
        str = Regex.Replace(str, @"\s", "-");
        return str.Length > 200 ? str.Substring(0, 200) : str;
    }
}

public record CreateBlogPostRequest(
    string Title,
    string Content,
    string? Summary,
    string? Category,
    string? Division,
    string? AuthorName,
    string? AuthorEmail,
    string? AuthorAvatar,
    string? CoverImageUrl);

public record UpdateBlogPostRequest(
    string? Title,
    string? Content,
    string? Summary,
    string? Category,
    string? Division,
    string? CoverImageUrl);

public record AddCommentRequest(
    string? AuthorName,
    string? AuthorEmail,
    string? AuthorAvatar,
    string Content);
