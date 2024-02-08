using Microsoft.AspNetCore.Mvc;
using API.Enums;
using API.Interfaces;
using API.Extensions;
using AutoMapper;
using API.DTOs;

namespace API.Controllers;

public class FilesController : BaseApiController
{
    private readonly string storagePath = "storage";
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationCenter _notificationCenter;
    private readonly IMapper _mapper;

    public FilesController(IUnitOfWork unitOfWork, INotificationCenter notificationCenter, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _notificationCenter = notificationCenter;
        _mapper = mapper;
    }

    [HttpPost("upload/{title}/{platform}")]
    [RequestSizeLimit(256 * 1024 * 1024)]
    public async Task<IActionResult> UploadFile([FromForm]IFormFile file, string title, Platform platform)
    {
        if (file == null || file.Length == 0) return BadRequest("Invalid file");

        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        var oldFileName = string.Empty;
        switch (platform)
        {
            case Platform.Windows: oldFileName = game.Files.WindowsName; break;
            case Platform.MacOS: oldFileName = game.Files.MacosName; break;
            case Platform.Linux: oldFileName = game.Files.LinuxName; break;
        }
        if (!string.IsNullOrEmpty(oldFileName))
        {
            var oldFilePath = Path.Combine(storagePath, oldFileName);
            if (System.IO.File.Exists(oldFilePath)) System.IO.File.Delete(oldFilePath);
        }

        var newFilePath = Path.Combine(storagePath, file.FileName);
        switch (platform)
        {
            case Platform.Windows:
                game.Files.WindowsName = file.FileName;
                game.Files.WindowsSize = file.Length;
                break;
            case Platform.MacOS:
                game.Files.MacosName = file.FileName;
                game.Files.MacosSize = file.Length;
                break;
            case Platform.Linux:
                game.Files.LinuxName = file.FileName;
                game.Files.LinuxSize = file.Length;
                break;
        }
        using (var stream = new FileStream(newFilePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        switch (platform)
        {
            case Platform.Windows:
                game.Files.WindowsName = file.FileName;
                game.Files.WindowsSize = file.Length;
                break;
            case Platform.MacOS:
                game.Files.MacosName = file.FileName;
                game.Files.MacosSize = file.Length;
                break;
            case Platform.Linux:
                game.Files.LinuxName = file.FileName;
                game.Files.LinuxSize = file.Length;
                break;
        }
        
        if (await _unitOfWork.Complete() || oldFileName == file.FileName)
        {
            _notificationCenter.FilesUpdated
            (
                User.GetUsername(),
                game.Id,
                _mapper.Map<FilesDto>(game.Files)
            );
            return Ok();
        }

        return BadRequest("Failed to upload file");
    }

    [HttpGet("download/{title}/{platform}")]
    [RequestSizeLimit(256 * 1024 * 1024)]
    public async Task<IActionResult> DownloadFile(string title, Platform platform)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        var fileName = string.Empty;
        switch (platform)
        {
            case Platform.Windows: fileName = game.Files.WindowsName; break;
            case Platform.MacOS: fileName = game.Files.MacosName; break;
            case Platform.Linux: fileName = game.Files.LinuxName; break;
        }
        if (string.IsNullOrEmpty(fileName)) return NotFound();

        var filePath = Path.Combine(storagePath, fileName);
        if (System.IO.File.Exists(filePath))
        { 
            return File
            (
                System.IO.File.OpenRead(filePath),
                "application/octet-stream",
                Path.GetFileName(filePath)
            );
        }
        return NotFound();
    }

    [HttpDelete("delete/{title}/{platform}")]
    public async Task<IActionResult> DeleteFile(string title, Platform platform)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        var fileName = string.Empty;
        switch (platform)
        {
            case Platform.Windows: fileName = game.Files.WindowsName; break;
            case Platform.MacOS: fileName = game.Files.MacosName; break;
            case Platform.Linux: fileName = game.Files.LinuxName; break;
        }
        if (string.IsNullOrEmpty(fileName)) return NotFound();

        var filePath = Path.Combine(storagePath, fileName);
        if (System.IO.File.Exists(filePath))
        { 
            System.IO.File.Delete(filePath);
            switch (platform)
            {
                case Platform.Windows:
                    game.Files.WindowsName = string.Empty;
                    game.Files.WindowsSize = 0;
                    break;
                case Platform.MacOS:
                    game.Files.MacosName = string.Empty;
                    game.Files.MacosSize = 0;
                    break;
                case Platform.Linux:
                    game.Files.LinuxName = string.Empty;
                    game.Files.LinuxSize = 0;
                    break;
            }

            _notificationCenter.FilesUpdated
            (
                User.GetUsername(),
                game.Id,
                _mapper.Map<FilesDto>(game.Files)
            );

            return Ok();
        }        
        return NotFound();
    }
}