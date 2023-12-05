using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;

namespace API;

public class ReviewsRepository : IReviewsRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public ReviewsRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
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

    public async Task<PagedList<ReviewDto>> GetReviewsForGame(
        PaginationParams paginationParams, int gameId)
    {
        var query = _context.Reviews.Where(r => r.GameId == gameId);

        query = paginationParams.OrderType switch
        {
            OrderType.Oldest => query.OrderBy(r => r.ReviewPosted),
            _ => query.OrderByDescending(r => r.ReviewPosted)
        };

        return await PagedList<ReviewDto>.CreateAsync
        (
            query.AsNoTracking().ProjectTo<ReviewDto>(_mapper.ConfigurationProvider),
            paginationParams.CurrentPage,
            paginationParams.ItemsPerPage
        );
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
