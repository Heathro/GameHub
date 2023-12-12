using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IReviewsRepository
{
    void AddReview(Review review);
    Task DeleteReviewAsync(int reviewerId, int gameId);
    Task<Review> GetReviewAsync(int reviewerId, int gameId);
    Task<PagedList<ReviewDto>> GetAllReviews(PaginationParams paginationParams);
    Task<PagedList<ReviewDto>> GetReviewsForGame(PaginationParams paginationParams, int gameId);
    Task<PagedList<ReviewDto>> GetReviewsForUser(PaginationParams paginationParams, int userId);
    Task<bool> SaveAllAsync();
}
