using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;

namespace API.Controllers;

public class ReviewsController : BaseApiController
{
    private readonly IReviewsRepository _reviewsRepository;
    private readonly IUsersRepository _usersRepository;
    private readonly IGamesRepository _gamesRepository;
    private readonly IMapper _mapper;

    public ReviewsController(IReviewsRepository reviewsRepository, IUsersRepository usersRepository,
        IGamesRepository gamesRepository, IMapper mapper)
    {
        _reviewsRepository = reviewsRepository;
        _usersRepository = usersRepository;
        _gamesRepository = gamesRepository;
        _mapper = mapper;
    }

    [HttpPost("new")]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto createReviewDto)
    {
        var username = User.GetUsername();
        var userId = User.GetUserId();

        var reviewer = await _usersRepository.GetUserByUsernameAsync(username);
        var game = await _gamesRepository.GetGameByTitleAsync(createReviewDto.GameTitle);

        if (game == null) return NotFound();

        var review = await _reviewsRepository.GetReviewAsync(userId, game.Id);

        if (review != null)
        {
            return BadRequest("You already reviewed this game");
        }

        review = new Review
        {
            ReviewerId = userId,
            ReviewerUsername = username,
            Reviewer = reviewer,
            GameId = game.Id,
            GameTitle = game.Title,
            Game = game,
            Content = createReviewDto.Content
        };

        _reviewsRepository.AddReview(review);

        if (await _reviewsRepository.SaveAllAsync()) return Ok(_mapper.Map<ReviewDto>(review));

        return BadRequest("Failed to create review");
    }
}
