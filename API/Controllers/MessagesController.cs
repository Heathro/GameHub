﻿using Microsoft.AspNetCore.Mvc;
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
            SenderUsername = sender.Username,
            RecipientUsername = recipient.Username,
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
}