using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using API.Interfaces;
using API.Extensions;
using API.Entities;
using API.DTOs;

namespace API.Controllers;

public class PublicationsController : BaseApiController
{
    private readonly IPublicationsRepository _publicationsRepository;
    private readonly IUsersRepository _usersRepository;
    private readonly IGamesRepository _gamesRepository;
    private readonly IMapper _mapper;

    public PublicationsController(IPublicationsRepository publicationsRepository, 
        IUsersRepository usersRepository, IGamesRepository gamesRepository, IMapper mapper)
    {
        _publicationsRepository = publicationsRepository;
        _usersRepository = usersRepository;
        _gamesRepository = gamesRepository;
        _mapper = mapper;
    }

    [HttpPost("new")]
    public async Task<ActionResult> PublishGame(GamePublishDto gamePublishDto)
    {
        if (await _gamesRepository.TitleExistsAsync(gamePublishDto.Title))
        {
            return BadRequest("Title is already taken");
        }

        var publisher = await _usersRepository.GetUserByUsernameAsync(User.GetUsername());
        
        var game = _mapper.Map<Game>(gamePublishDto);
        game.Poster = new Poster{ Url = "" };

        var publication = new Publication{ Title = game };

        publisher.Publications.Add(publication);

        if (await _gamesRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to publish game");
    }
}
