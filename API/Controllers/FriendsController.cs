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
    public async Task<ActionResult<FriendshipDto>> AddFriend(string inviteeUsername)
    {
        var inviterId = User.GetUserId();
        var inviter = await _friendsRepository.GetUserWithFriends(inviterId);
        if (inviter == null) return NotFound();

        var invitee = await _usersRepository.GetUserByUsernameAsync(inviteeUsername);
        if (invitee == null) return NotFound();

        if (inviter.UserName == inviteeUsername) return BadRequest("You cannot add yourself");

        var friendship = await _friendsRepository.GetFriendship(inviterId, invitee.Id);
        
        var deleting = false;
        if (friendship != null)
        {
            deleting = true;
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
            
        var friendshipDto = new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(invitee),
            Status = deleting ? FriendStatus.None : friendship.Status
        };

        if (await _friendsRepository.SaveAllAsync()) return Ok(friendshipDto);

        return BadRequest("Failed to add friend");
    }

    [HttpPost("update-status/{inviterUsername}/{status}")]
    public async Task<ActionResult<FriendshipDto>> UpdateFriendStatus(
        string inviterUsername, FriendStatus status)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _friendsRepository.GetUserWithFriends(currentUserId);
        if (currentUser == null) return NotFound();

        var inviter = await _usersRepository.GetUserByUsernameAsync(inviterUsername);
        if (inviter == null) return NotFound();

        var friendship = await _friendsRepository.GetFriendship(inviter.Id, currentUserId);
        if (friendship == null) return NotFound();

        if (friendship.Status == status) return BadRequest("Nothing to change");

        var updatedFriendship = new Friendship
        {
            Inviter = friendship.Inviter,
            InviterId = friendship.InviterId,
            Invitee = friendship.Invitee,
            InviteeId = friendship.InviteeId,
            Status = status
        };
        currentUser.Inviters.Remove(friendship);
        currentUser.Inviters.Add(updatedFriendship);

        var friendshipDto = new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(inviter),
            Status = status
        };

        if (await _friendsRepository.SaveAllAsync()) return Ok(friendshipDto);

        return BadRequest("Failed to update status");
    }

    [HttpGet("candidate/{candidateUsername}")]
    public async Task<ActionResult<FriendshipDto>> GetFriend(string candidateUsername)
    {
        var currentUserId = User.GetUserId();

        var candidate = await _usersRepository.GetUserByUsernameAsync(candidateUsername);
        if (candidate == null) return NotFound();

        if (candidate.Id == currentUserId) return BadRequest("You cannot get yourself");

        var friendship = await _friendsRepository.GetFriend(currentUserId, candidate.Id);
        if (friendship != null) return friendship;

        return new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(candidate),
            Status = FriendStatus.None
        };
    }

    [HttpGet("list/{status}/{type}")]
    public async Task<IEnumerable<FriendshipDto>> GetFriends(FriendStatus status, FriendRequestType type)
    {
        return await _friendsRepository.GetFriends(User.GetUserId(), status, type);
    }
}
