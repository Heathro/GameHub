﻿using Microsoft.AspNetCore.Mvc;
using API.Interfaces;
using API.Extensions;
using API.Entities;

namespace API.Controllers;

public class FriendsController : BaseApiController
{
    private readonly IFriendsRepository _friendsRepository;
    private readonly IUsersRepository _usersRepository;

    public FriendsController(IFriendsRepository friendsRepository, IUsersRepository usersRepository)
    {
        _friendsRepository = friendsRepository;
        _usersRepository = usersRepository;
    }

    [HttpPost("{inviteeUsername}")]
    public async Task<ActionResult> AddFriend(string inviteeUsername)
    {
        var inviterId = User.GetUserId();
        var inviter = await _friendsRepository.GetUserWithInvitees(inviterId);

        var invitee = await _usersRepository.GetUserByUsernameAsync(inviteeUsername);
        if (invitee == null) return NotFound();

        if (inviter.UserName == inviteeUsername) return BadRequest("You cannot add yourself");

        var friendship = await _friendsRepository.GetFriendship(inviterId, invitee.Id);

        if (friendship != null)
        {
            inviter.Invitees.Remove(friendship);
        }
        else
        {
            friendship = new Friendship
            {
                InviterId = inviterId,
                InviteeId = invitee.Id,
                Accepted = false
            };
            inviter.Invitees.Add(friendship);
        }

        if (await _friendsRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to add Friend");
    }
}