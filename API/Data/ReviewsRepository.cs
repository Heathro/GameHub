using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API;

public class ReviewsRepository : IReviewsRepository
{
    private readonly DataContext _context;

    public ReviewsRepository(DataContext context)
    {
        _context = context;
    }

    public void AddReview(Review review)
    {
        _context.Reviews.Add(review);
    }

    public void DeleteReview(Review review)
    {
        _context.Reviews.Remove(review);
    }

    public async Task<Review> GetReviewAsync(int reviewerId, int gameId)
    {
        return await _context.Reviews
            .SingleOrDefaultAsync(r => r.ReviewerId == reviewerId && r.GameId == gameId);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
