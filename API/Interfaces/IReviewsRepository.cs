using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IReviewsRepository
{
    void AddReview(Review message);
    void DeleteReview(Review message);
    Task<Review> GetReviewAsync(int reviewerId, int gameId);
    Task<bool> SaveAllAsync();
}
