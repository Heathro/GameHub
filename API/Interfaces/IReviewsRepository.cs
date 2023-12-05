using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IReviewsRepository
{
    void AddReview(Review message);
    void DeleteReview(Review message);
    Task<Review> GetReviewAsync(int reviewerId, int gameId);
    Task<PagedList<ReviewDto>> GetReviewsForGame(PaginationParams paginationParams, int gameId);
    Task<bool> SaveAllAsync();
}
