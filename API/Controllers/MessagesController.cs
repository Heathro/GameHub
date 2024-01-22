using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API.Controllers;
using API.Interfaces;
using API.Extensions;
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
}
