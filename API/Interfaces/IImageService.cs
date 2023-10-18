using CloudinaryDotNet.Actions;

namespace API.Interfaces;

public interface IImageService
{
    Task<ImageUploadResult> AddImageAsync(IFormFile file);
    Task<DeletionResult> DeleteImageAsync(string publicId);
}
