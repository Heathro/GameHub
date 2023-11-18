using Microsoft.AspNetCore.Mvc;
using API.Interfaces;
using API.Extensions;
using API.Entities;
using API.DTOs;
using AutoMapper;
using API.Helpers;

namespace API.Controllers;

public class FriendsController : BaseApiController
{
    private readonly IFriendsRepository _friendsRepository;
    private readonly IMapper _mapper;
    private readonly IUsersRepository _usersRepository;

    public FriendsController(IFriendsRepository friendsRepository, IMapper mapper,
        IUsersRepository usersRepository)
    {
        _friendsRepository = friendsRepository;
        _mapper = mapper;
        _usersRepository = usersRepository;
    }

    [HttpPost("add-friend/{inviteeUsername}")]
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
                Status = FriendStatus.Pending
            };
            inviter.Invitees.Add(friendship);
        }

        if (await _friendsRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to add Friend");
    }

    [HttpGet("candidate/{candidateId}")]
    public async Task<ActionResult<FriendshipDto>> GetFriend(int candidateId)
    {
        var currentUserId = User.GetUserId();

        if (candidateId == currentUserId) return BadRequest("Cant friend yourself");

        var friend = await _friendsRepository.GetFriend(currentUserId, candidateId);

        if (friend != null) return friend;

        var candidate = await _usersRepository.GetUserByIdAsync(candidateId);
        if (candidate == null) return NotFound();

        return new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(candidate),
            Status = FriendStatus.None
        };
    }

    [HttpGet("active-friends")]
    public async Task<IEnumerable<FriendshipDto>> GetFriends()
    {
        return await _friendsRepository.GetActiveFriends(User.GetUserId());
    }
}
