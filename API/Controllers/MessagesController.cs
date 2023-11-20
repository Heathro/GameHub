using Microsoft.AspNetCore.Mvc;
using API.Controllers;
using API.Interfaces;
using AutoMapper;
using API.DTOs;
using API.Extensions;
using API.Entities;
using API.Helpers;

namespace API;

public class MessagesController : BaseApiController
{
    private readonly IUsersRepository _usersRepository;
    private readonly IMessagesRepository _messagesRepository;
    private readonly IMapper _mapper;

    public MessagesController(IUsersRepository usersRepository, IMessagesRepository messagesRepository,
        IMapper mapper)
    {
        _usersRepository = usersRepository;
        _messagesRepository = messagesRepository;
        _mapper = mapper;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var username = User.GetUsername();

        if (username == createMessageDto.RecipientUsername)
        {
            return BadRequest("You cannot send messages to yourselft");
        }

        var sender = await _usersRepository.GetUserByUsernameAsync(username);
        var recipient = await _usersRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

        if (recipient == null) return NotFound();

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            RecipientUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        _messagesRepository.AddMessage(message);

        if (await _messagesRepository.SaveAllAsync()) return Ok(_mapper.Map<MessageDto>(message));

        return BadRequest("Failed to create message");
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser(
        [FromQuery]PaginationParams paginationParams)
    {
        var messages = await _messagesRepository.GetMessagesForUser(paginationParams, User.GetUsername());

        Response.AddPaginationHeader(new PaginationHeader
        (
            messages.CurrentPage,
            messages.ItemsPerPage,
            messages.TotalItems,
            messages.TotalPages
        ));

        return messages;
    }

    [HttpGet("thread/{username}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
    {
        return Ok(await _messagesRepository.GetMessageThread(User.GetUsername(), username));
    }

    [HttpGet("companions")]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetCompanions()
    {
        return Ok(await _messagesRepository.GetCompanions(User.GetUsername()));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        var username = User.GetUsername();
        var message = await _messagesRepository.GetMessage(id);

        if (message.SenderUsername != username && message.RecipientUsername != username)
        {
            return Unauthorized();
        }

        if (message.SenderUsername == username) message.SenderDeleted = true;
        if (message.RecipientUsername == username) message.RecipientDeleted = true;

        if (message.SenderDeleted && message.RecipientDeleted)
        {
            _messagesRepository.DeleteMessage(message);
        }

        if (await _messagesRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to delete message");
    }

    [HttpDelete("{recipientUsername}")]
    public async Task<ActionResult> DeleteMessages(string recipientUsername)
    {
        var currentUsername = User.GetUsername();
        var messages = await _messagesRepository.GetMessages(currentUsername, recipientUsername);

        foreach (var message in messages)
        {
            if (message.SenderUsername == currentUsername) message.SenderDeleted = true;
            if (message.RecipientUsername == currentUsername) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
            {
                _messagesRepository.DeleteMessage(message);
            }
        }
        
        if (await _messagesRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to delete messages");
    }
}
