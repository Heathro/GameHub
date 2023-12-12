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

    public async Task DeleteReviewAsync(int reviewerId, int gameId)
    {
        var review = await _context.Reviews
            .SingleOrDefaultAsync(r => r.ReviewerId == reviewerId && r.GameId == gameId);

        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Review> GetReviewAsync(int reviewerId, int gameId)
    {
        return await _context.Reviews
            .Include(r => r.Reviewer).ThenInclude(u => u.Avatar)
            .Include(r => r.Game).ThenInclude(g => g.Poster)
            .SingleOrDefaultAsync(r => r.ReviewerId == reviewerId && r.GameId == gameId);
    }

    public async Task<PagedList<ReviewDto>> GetAllReviews(PaginationParams paginationParams)
    {
        var query = _context.Reviews.AsQueryable();
        
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

    public async Task<PagedList<ReviewDto>> GetReviewsForGame(PaginationParams paginationParams, int gameId)
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

    public async Task<PagedList<ReviewDto>> GetReviewsForUser(PaginationParams paginationParams, int userId)
    {
        var query = _context.Reviews.Where(r => r.ReviewerId == userId);
        
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
