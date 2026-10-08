using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TourFlow.Application.Common.Interfaces;

namespace TourFlow.Infrastructure.Services;

public class CloudinaryPhotoService : IPhotoService
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<CloudinaryPhotoService> _logger;
    public bool IsConfigured { get; }

    public CloudinaryPhotoService(IConfiguration configuration, ILogger<CloudinaryPhotoService> logger)
    {
        _logger = logger;
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (!string.IsNullOrWhiteSpace(cloudName) &&
            !string.IsNullOrWhiteSpace(apiKey) &&
            !string.IsNullOrWhiteSpace(apiSecret))
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            IsConfigured = true;
            _logger.LogInformation("CloudinaryPhotoService initialized successfully for cloud: {CloudName}", cloudName);
        }
        else
        {
            IsConfigured = false;
            _logger.LogWarning("Cloudinary credentials not fully configured. Cloudinary uploads disabled.");
        }
    }

    public async Task<PhotoUploadResult> UploadPhotoAsync(Stream fileStream, string fileName, string? folder = "tourflow/uploads")
    {
        if (!IsConfigured || _cloudinary == null)
        {
            return new PhotoUploadResult("", "", false, "Cloudinary is not configured.");
        }

        try
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = folder ?? "tourflow/uploads",
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error.Message);
                return new PhotoUploadResult("", "", false, uploadResult.Error.Message);
            }

            var url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? "";
            return new PhotoUploadResult(url, uploadResult.PublicId, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during Cloudinary upload for file {FileName}", fileName);
            return new PhotoUploadResult("", "", false, ex.Message);
        }
    }

    public async Task<bool> DeletePhotoAsync(string publicId)
    {
        if (!IsConfigured || _cloudinary == null || string.IsNullOrWhiteSpace(publicId))
        {
            return false;
        }

        try
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete Cloudinary photo with publicId: {PublicId}", publicId);
            return false;
        }
    }
}
