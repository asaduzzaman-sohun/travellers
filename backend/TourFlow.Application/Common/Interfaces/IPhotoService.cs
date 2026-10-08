namespace TourFlow.Application.Common.Interfaces;

public record PhotoUploadResult(string Url, string PublicId, bool IsSuccess, string? ErrorMessage = null);

public interface IPhotoService
{
    Task<PhotoUploadResult> UploadPhotoAsync(Stream fileStream, string fileName, string? folder = "tourflow/uploads");
    Task<bool> DeletePhotoAsync(string publicId);
    bool IsConfigured { get; }
}
