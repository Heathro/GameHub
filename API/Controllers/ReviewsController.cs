﻿using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Helpers;

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
        var game = await _gamesRepository.GetGameByTitleAsync(createReviewDto.GameTitle);
        if (game == null) return NotFound();

        var username = User.GetUsername();
        var userId = User.GetUserId();
        var reviewer = await _usersRepository.GetUserByUsernameAsync(username);

        var review = await _reviewsRepository.GetReviewAsync(userId, game.Id);
        if (review != null)
        {
            review.Content = createReviewDto.Content;
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
                Content = createReviewDto.Content
            };
            _reviewsRepository.AddReview(review);
        }

        if (await _reviewsRepository.SaveAllAsync()) return Ok(_mapper.Map<ReviewDto>(review));

        return BadRequest("Failed to create review");
    }
    

    [HttpGet("list")]
    public async Task<ActionResult<PagedList<ReviewDto>>> GetAllReviews(
        [FromQuery]PaginationParams paginationParams)
    {
        var reviews = await _reviewsRepository.GetAllReviews(paginationParams);

        Response.AddPaginationHeader(new PaginationHeader(
            reviews.CurrentPage,
            reviews.ItemsPerPage,
            reviews.TotalItems,
            reviews.TotalPages
        ));

        return Ok(reviews);
    }

    [HttpGet("game/{gameId}")]
    public async Task<ActionResult<PagedList<ReviewDto>>> GetReviewsForGame(
        [FromQuery]PaginationParams paginationParams, int gameId)
    {        
        var game = await _gamesRepository.GetGameByIdAsync(gameId);
        if (game == null) return NotFound();

        var reviews = await _reviewsRepository.GetReviewsForGame(paginationParams, gameId);

        Response.AddPaginationHeader(new PaginationHeader(
            reviews.CurrentPage,
            reviews.ItemsPerPage,
            reviews.TotalItems,
            reviews.TotalPages
        ));

        return Ok(reviews);
    }

    [HttpGet("player/{userId}")]
    public async Task<ActionResult<PagedList<ReviewDto>>> GetReviewsForUser(
        [FromQuery]PaginationParams paginationParams, int userId)
    {
        var user = await _usersRepository.GetUserByIdAsync(userId);
        if (user == null) return NotFound();

        var reviews = await _reviewsRepository.GetReviewsForUser(paginationParams, userId);

        Response.AddPaginationHeader(new PaginationHeader(
            reviews.CurrentPage,
            reviews.ItemsPerPage,
            reviews.TotalItems,
            reviews.TotalPages
        ));

        return Ok(reviews);
    }

    [HttpGet("menu/{title}")]
    public async Task<ActionResult<ReviewMenuDto>> GetReviewMenu(string title)
    {
        var game = await _gamesRepository.GetGameAsync(title);
        if (game == null) return NotFound();

        var review = await _reviewsRepository.GetReviewAsync(User.GetUserId(), game.Id);

        return Ok(new ReviewMenuDto
        {
            Posted = review != null,
            Game = game,
            Content = review == null ? "" : review.Content
        });
    }

    [HttpDelete("delete/{gameId}")]
    public async Task<ActionResult> DeleteUser(int gameId)
    {
        await _reviewsRepository.DeleteReviewAsync(User.GetUserId(), gameId);

        if (await _reviewsRepository.SaveAllAsync()) return BadRequest("Failed to delete review");
        
        return Ok();
    }
}
