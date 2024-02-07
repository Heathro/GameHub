using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using API.Interfaces;
using API.Extensions;
using API.Entities;
using API.DTOs;

namespace API.Controllers;

public class PublicationsController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly INotificationCenter _notificationCenter;

    public PublicationsController(IUnitOfWork unitOfWork, IMapper mapper, 
        INotificationCenter notificationCenter)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationCenter = notificationCenter;
    }

    [HttpPost("new")]
    public async Task<ActionResult> PublishGame(GamePublishDto gamePublishDto)
    {
        if (await _unitOfWork.GamesRepository.TitleExistsAsync(gamePublishDto.Title))
        {
            return BadRequest("Title is already taken");
        }

        var publisher = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(User.GetUsername());
        
        var game = _mapper.Map<Game>(gamePublishDto);
        game.Poster = new Poster{ Url = "" };
        game.Video = "";
        game.Files = new Files
        {
            WindowsName = "",
            WindowsSize = 0,
            MacosName = "",
            MacosSize = 0,
            LinuxName = "",
            LinuxSize = 0
        };

        var publication = new Publication{ Title = game };

        publisher.Publications.Add(publication);

        if (await _unitOfWork.Complete())
        {
            _notificationCenter.GamePublished(User.GetUsername(), _mapper.Map<GameDto>(game));

            return Ok();
        }

        return BadRequest("Failed to publish game");
    }
}
