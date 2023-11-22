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
    public async Task<ActionResult<FriendshipDto>> AddFriend(string username)
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
            
        var friendshipDto = new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(userToAdd),
            Status = friendship.Status
        };

        if (await _friendsRepository.SaveAllAsync()) return Ok(friendshipDto);

        return BadRequest("Failed to add friend");
    }

    [HttpDelete("delete-friend/{username}")]
    public async Task<ActionResult<FriendshipDto>> DeleteFriend(string username)
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

        var friendshipDto = new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(userToDelete),
            Status = FriendStatus.None
        };

        if (await _friendsRepository.SaveAllAsync()) return Ok(friendshipDto);

        return BadRequest("Failed to delete friend");
    }

    [HttpPost("update-status/{username}/{status}")]
    public async Task<ActionResult<FriendshipDto>> UpdateFriendStatus(string username, FriendStatus status)
    {
        var currentUserId = User.GetUserId();
        var currentUser = await _friendsRepository.GetUserWithFriends(currentUserId);
        if (currentUser.UserName == username) return BadRequest("You cannot update yourself");

        var userToUpdate = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToUpdate == null) return NotFound();

        var friendship = await _friendsRepository.GetFriendship(userToUpdate.Id, currentUserId);
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
            Player = _mapper.Map<PlayerDto>(userToUpdate),
            Status = status
        };

        if (await _friendsRepository.SaveAllAsync()) return Ok(friendshipDto);

        return BadRequest("Failed to update status");
    }

    [HttpGet("player-with-status/{username}")]
    public async Task<ActionResult<FriendshipDto>> GetPlayerWithStatus(string username)
    {
        if (username == User.GetUsername()) return BadRequest("You cannot request yourself");
        
        var currentUserId = User.GetUserId();

        var userToReturn = await _usersRepository.GetUserByUsernameAsync(username);
        if (userToReturn == null) return NotFound();

        var friendship = await _friendsRepository.GetFriend(currentUserId, userToReturn.Id);
        if (friendship != null) return friendship;

        return new FriendshipDto
        {
            Player = _mapper.Map<PlayerDto>(userToReturn),
            Status = FriendStatus.None
        };
    }

    [HttpGet("list/{status}/{type}")]
    public async Task<IEnumerable<FriendshipDto>> GetFriends(FriendStatus status, FriendRequestType type)
    {
        return await _friendsRepository.GetFriends(User.GetUserId(), status, type);
    }

    [HttpGet("players")]
    public async Task<ActionResult<PagedList<FriendshipDto>>> GetUsers(
        [FromQuery]PaginationParams paginationParams)
    {
        var users = await _friendsRepository.GetFriendsAsync(paginationParams, User.GetUserId());

        Response.AddPaginationHeader(new PaginationHeader(
            users.CurrentPage,
            users.ItemsPerPage,
            users.TotalItems,
            users.TotalPages
        ));

        return Ok(users);
    }
}
