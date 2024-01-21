using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Helpers;

namespace API.Controllers;

public class ReviewsController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ReviewsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpPost("new")]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto createReviewDto)
    {        
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(createReviewDto.GameTitle);
        if (game == null) return NotFound();

        var username = User.GetUsername();
        var userId = User.GetUserId();
        var reviewer = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(username);

        var review = await _unitOfWork.ReviewsRepository.GetReviewAsync(userId, game.Id);
        if (review != null)
        {
            review.Content = createReviewDto.Content;
            review.IsApproved = false;
        }
        else
        {
            review = new Review
            {
                ReviewerId = userId,
                ReviewerUsername = username,
                Reviewer = reviewer,
                GameId = game.Id,
                GameTitle = game.Title,
                Game = game,
                Content = createReviewDto.Content,
                IsApproved = false
            };
            _unitOfWork.ReviewsRepository.AddReview(review);
        }

        if (await _unitOfWork.Complete())
        {
            return Ok(_mapper.Map<ReviewDto>(review));
        } 

        return BadRequest("Failed to create review");
    }
    

    [HttpGet("list")]
    public async Task<ActionResult<PagedList<ReviewDto>>> GetAllReviews(
        [FromQuery]PaginationParams paginationParams)
    {
        var reviews = await _unitOfWork.ReviewsRepository.GetAllReviews(paginationParams);

        Response.AddPaginationHeader(new PaginationHeader(
            reviews.CurrentPage,
            reviews.ItemsPerPage,
            reviews.TotalItems,
            reviews.TotalPages
        ));

        return Ok(reviews);
    }

    [HttpGet("game/{title}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsForGame(string title)
    {
        var game = await _unitOfWork.GamesRepository.GetGameByTitleAsync(title);
        if (game == null) return NotFound();

        var reviews = await _unitOfWork.ReviewsRepository.GetReviewsForGame(game.Id);

        return Ok(reviews);
    }

    [HttpGet("player/{userName}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsForUser(string userName)
    {
        var user = await _unitOfWork.UsersRepository.GetUserByUsernameAsync(userName);
        if (user == null) return NotFound();

        var reviews = await _unitOfWork.ReviewsRepository.GetReviewsForUser(user.Id);

        return Ok(reviews);
    }

    [HttpGet("menu/{title}")]
    public async Task<ActionResult<ReviewMenuDto>> GetReviewMenu(string title)
    {
        var game = await _unitOfWork.GamesRepository.GetGameAsync(title);
        if (game == null) return NotFound();

        var review = await _unitOfWork.ReviewsRepository.GetReviewAsync(User.GetUserId(), game.Id);

        return Ok(new ReviewMenuDto
        {
            Id = review == null ? 0 : review.Id,
            Posted = review != null,
            Game = game,
            Content = review == null ? "" : review.Content
        });
    }

    [HttpDelete("delete/{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        _unitOfWork.ReviewsRepository.DeleteReview(id);

        if (await _unitOfWork.Complete()) return Ok();
        
        return BadRequest("Failed to delete review");
    }
}
