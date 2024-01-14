using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IReviewsRepository
{
    void AddReview(Review review);
    void DeleteReview(int id);
    void ApproveReview(int id);
    Task<Review> GetReviewAsync(int reviewerId, int gameId);
    Task<PagedList<ReviewDto>> GetAllReviews(PaginationParams paginationParams);
    Task<PagedList<ReviewModerationDto>> GetReviewsForModeration(PaginationParams paginationParams);
    Task<IEnumerable<ReviewDto>> GetReviewsForGame(int gameId);
    Task<IEnumerable<ReviewDto>> GetReviewsForUser(int userId);
}
