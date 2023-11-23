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

    [HttpPost("add-friend/{username}")]
    public async Task<ActionResult<PlayerDto>> AddFriend(string username)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _friendsRepository.GetUserWithFriends(currentUserId);        
        if (currentUser.UserName == username) return BadRequest("You cannot add yourself");

        var userToAdd = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToAdd == null) return NotFound();

        var friendship = await _friendsRepository.GetFriendship(currentUserId, userToAdd.Id);
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
        var currentUser = await _friendsRepository.GetUserWithFriends(currentUserId);
        if (currentUser.UserName == username) return BadRequest("You cannot delete yourself");

        var userToDelete = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToDelete == null) return NotFound();

        var friendship = await _friendsRepository.GetFriendship(currentUserId, userToDelete.Id);
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
        var currentUser = await _friendsRepository.GetUserWithFriends(currentUserId);
        if (currentUser.UserName == username) return BadRequest("You cannot update yourself");

        var userToUpdate = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToUpdate == null) return NotFound();

        var currentFriendship = await _friendsRepository.GetFriendship(userToUpdate.Id, currentUserId);
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

    [HttpGet("players")]
    public async Task<ActionResult<PagedList<PlayerDto>>> GetPlayersAsync(
        [FromQuery]PaginationParams paginationParams)
    {
        var players = await _friendsRepository.GetPlayersAsync(paginationParams, User.GetUserId());

        Response.AddPaginationHeader(new PaginationHeader(
            players.CurrentPage,
            players.ItemsPerPage,
            players.TotalItems,
            players.TotalPages
        ));

        return Ok(players);
    }

    [HttpGet("player/{username}")]
    public async Task<ActionResult<PlayerDto>> GetPlayerAsync(string username)
    {
        var player = await _friendsRepository.GetPlayerAsync(User.GetUserId(), username);

        return Ok(player);
    }

    [HttpGet("list")]
    public async Task<ActionResult<PlayerDto>> GetFriendsAsync()
    {
        var friends = await _friendsRepository.GetFriendsAsync(User.GetUserId());

        return Ok(friends);
    }
}
