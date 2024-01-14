using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Controllers;
using API.Interfaces;
using API.Extensions;
using API.Entities;
using API.DTOs;

namespace API;

[Authorize]
public class MessagesController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;

    public MessagesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("companions")]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetCompanions()
    {
        return Ok(await _unitOfWork.MessagesRepository.GetCompanionsAsync(User.GetUsername()));
    }

    // [HttpPost("new")]
    // public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    // {
    //     var username = User.GetUsername();

    //     if (username == createMessageDto.RecipientUsername)
    //     {
    //         return BadRequest("You cannot send messages to yourself");
    //     }

    //     var sender = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(username);
    //     var recipient = await _unitOfWork.UsersRepository
    //         .GetUserByUsernameAsync(createMessageDto.RecipientUsername);

    //     if (recipient == null) return NotFound();

    //     var message = new Message
    //     {
    //         Sender = sender,
    //         Recipient = recipient,
    //         SenderUsername = sender.UserName,
    //         RecipientUsername = recipient.UserName,
    //         Content = createMessageDto.Content
    //     };

    //     _unitOfWork.MessagesRepository.AddMessage(message);

    //     if (await _unitOfWork.Complete()) return Ok(_mapper.Map<MessageDto>(message));

    //     return BadRequest("Failed to create message");
    // }

    // [HttpGet("thread/{username}")]
    // public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
    // {
    //     return Ok(await _unitOfWork.MessagesRepository.GetMessageThreadAsync(User.GetUsername(), username));
    // }

    // [HttpDelete("delete-message/{id:int}")]
    // public async Task<ActionResult> DeleteMessage(int id)
    // {
    //     var username = User.GetUsername();
    //     var message = await _unitOfWork.MessagesRepository.GetMessageAsync(id);

    //     if (message.SenderUsername != username && message.RecipientUsername != username)
    //     {
    //         return Unauthorized();
    //     }

    //     if (message.SenderUsername == username) message.SenderDeleted = true;
    //     if (message.RecipientUsername == username) message.RecipientDeleted = true;

    //     if (message.SenderDeleted && message.RecipientDeleted)
    //     {
    //         _unitOfWork.MessagesRepository.DeleteMessage(message);
    //     }

    //     if (await _unitOfWork.Complete()) return Ok();

    //     return BadRequest("Failed to delete message");
    // }

    // [HttpDelete("delete-messages/{recipientUsername}")]
    // public async Task<ActionResult> DeleteMessages(string recipientUsername)
    // {
    //     var currentUsername = User.GetUsername();
    //     var messages = await _unitOfWork.MessagesRepository
    //         .GetMessagesAsync(currentUsername, recipientUsername);

    //     foreach (var message in messages)
    //     {
    //         if (message.SenderUsername == currentUsername) message.SenderDeleted = true;
    //         if (message.RecipientUsername == currentUsername) message.RecipientDeleted = true;

    //         if (message.SenderDeleted && message.RecipientDeleted)
    //         {
    //             _unitOfWork.MessagesRepository.DeleteMessage(message);
    //         }
    //     }
        
    //     if (await _unitOfWork.Complete()) return Ok();

    //     return BadRequest("Failed to delete messages");
    // }
}
