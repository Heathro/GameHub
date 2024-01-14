using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using API.Interfaces;
using API.Extensions;
using API.Entities;
using API.Enums;
using API.DTOs;

namespace API.Controllers;

[Authorize]
public class FriendsController : BaseApiController
{
    private readonly IFriendsRepository _friendsRepository;
    private readonly IUsersRepository _usersRepository;
    private readonly IMapper _mapper;

    public FriendsController(IFriendsRepository friendsRepository,
        IUsersRepository usersRepository, IMapper mapper)
    {
        _friendsRepository = friendsRepository;
        _usersRepository = usersRepository;
        _mapper = mapper;
    }

    [HttpPost("add-friend/{username}")]
    public async Task<ActionResult<PlayerDto>> AddFriend(string username)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _friendsRepository.GetUserWithFriendsAsync(currentUserId);        
        if (currentUser.UserName == username) return BadRequest("You cannot add yourself");

        var userToAdd = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToAdd == null) return NotFound();

        var friendship = await _friendsRepository.GetFriendshipAsync(currentUserId, userToAdd.Id);
        if (friendship != null) return BadRequest("You already send request");
        
        friendship = new Friendship
        {
            InviterId = currentUserId,
            InviteeId = userToAdd.Id,
            Status = FriendStatus.Pending
        };
        currentUser.Invitees.Add(friendship);
            
        var player = _mapper.Map<PlayerDto>(userToAdd);        
        player.Status = friendship.Status;
        player.Type = FriendRequestType.Outcome;

        if (await _friendsRepository.SaveAllAsync()) return Ok(player);

        return BadRequest("Failed to add friend");
    }

    [HttpDelete("delete-friend/{username}")]
    public async Task<ActionResult<PlayerDto>> DeleteFriend(string username)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _friendsRepository.GetUserWithFriendsAsync(currentUserId);
        if (currentUser.UserName == username) return BadRequest("You cannot delete yourself");

        var userToDelete = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToDelete == null) return NotFound();

        var friendship = await _friendsRepository.GetFriendshipAsync(currentUserId, userToDelete.Id);
        if (friendship == null) return NotFound();

        if (friendship.InviterId == currentUserId)
        {
            currentUser.Invitees.Remove(friendship);
        }
        else
        {
            currentUser.Inviters.Remove(friendship);
        }

        var player = _mapper.Map<PlayerDto>(userToDelete);
        player.Status = FriendStatus.None;
        player.Type = FriendRequestType.All;

        if (await _friendsRepository.SaveAllAsync()) return Ok(player);

        return BadRequest("Failed to delete friend");
    }

    [HttpPost("update-status/{username}/{status}")]
    public async Task<ActionResult<PlayerDto>> UpdateFriendStatus(string username, FriendStatus status)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _friendsRepository.GetUserWithFriendsAsync(currentUserId);
        if (currentUser.UserName == username) return BadRequest("You cannot update yourself");

        var userToUpdate = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToUpdate == null) return NotFound();

        var currentFriendship = await _friendsRepository.GetFriendshipAsync(userToUpdate.Id, currentUserId);
        if (currentFriendship == null) return NotFound();

        if (currentFriendship.Status == status) return BadRequest("Nothing to update");

        var updatedFriendship = new Friendship
        {
            Inviter = currentFriendship.Inviter,
            InviterId = currentFriendship.InviterId,
            Invitee = currentFriendship.Invitee,
            InviteeId = currentFriendship.InviteeId,
            Status = status
        };
        currentUser.Inviters.Remove(currentFriendship);
        currentUser.Inviters.Add(updatedFriendship);

        var player = _mapper.Map<PlayerDto>(userToUpdate);
        player.Status = status;        
        player.Type = FriendRequestType.All;

        if (await _friendsRepository.SaveAllAsync()) return Ok(player);

        return BadRequest("Failed to update status");
    }

    [HttpGet("list")]
    public async Task<ActionResult<PlayerDto>> GetFriendsAsync()
    {
        var friends = await _friendsRepository.GetFriendsAsync(User.GetUserId());

        return Ok(friends);
    }
}
