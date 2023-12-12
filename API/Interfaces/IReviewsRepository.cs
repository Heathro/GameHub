﻿using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IReviewsRepository
{
    void AddReview(Review review);
    Task DeleteReviewAsync(int id);
    Task<Review> GetReviewAsync(int reviewerId, int gameId);
    Task<PagedList<ReviewDto>> GetAllReviews(PaginationParams paginationParams);
    Task<IEnumerable<ReviewDto>> GetReviewsForGame(int gameId);
    Task<IEnumerable<ReviewDto>> GetReviewsForUser(int userId);
    Task<bool> SaveAllAsync();
}
