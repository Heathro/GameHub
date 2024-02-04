using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using API.Enums;

namespace API.Data;

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

    public async Task<Review> GetReviewByIdAsync(int id)
    {
        return await _context.Reviews
            .IgnoreQueryFilters()
            .Include(r => r.Reviewer).ThenInclude(u => u.Avatar)
            .Include(r => r.Game).ThenInclude(g => g.Poster)
            .AsSplitQuery()
            .SingleOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Review> GetReviewAsync(int reviewerId, int gameId)
    {
        return await _context.Reviews
            .IgnoreQueryFilters()
            .Include(r => r.Reviewer).ThenInclude(u => u.Avatar)
            .Include(r => r.Game).ThenInclude(g => g.Poster)
            .AsSplitQuery()
            .SingleOrDefaultAsync(r => r.ReviewerId == reviewerId && r.GameId == gameId);
    }

    public async Task<PagedList<ReviewDto>> GetAllReviews(PaginationParams paginationParams)
    {
        var query = _context.Reviews.AsQueryable();
        
        query = paginationParams.OrderType switch
        {
            OrderType.MostLiked => query.OrderByDescending(r => r.Game.LikedUsers.Count),
            OrderType.LessLiked => query.OrderBy(r => r.Game.LikedUsers.Count),
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

    public async Task<PagedList<ReviewModerationDto>> GetReviewsForModeration(
        PaginationParams paginationParams, string currentUsername)
    {
        var query = _context.Reviews
            .IgnoreQueryFilters()
            .Where(r => r.IsApproved == false && r.ReviewerUsername != currentUsername)
            .AsQueryable();
        
        query = paginationParams.OrderType switch
        {
            OrderType.Oldest => query.OrderBy(r => r.ReviewPosted),
            _ => query.OrderByDescending(r => r.ReviewPosted)
        };

        return await PagedList<ReviewModerationDto>.CreateAsync
        (
            query.AsNoTracking().ProjectTo<ReviewModerationDto>(_mapper.ConfigurationProvider),
            paginationParams.CurrentPage,
            paginationParams.ItemsPerPage
        );
    }

    public async Task<IEnumerable<ReviewDto>> GetReviewsForGame(int gameId)
    {
        return await _context.Reviews
            .Where(r => r.GameId == gameId)
            .OrderByDescending(r => r.ReviewPosted)
            .ProjectTo<ReviewDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<IEnumerable<ReviewDto>> GetReviewsForUser(int userId)
    {
        return await _context.Reviews
            .Where(r => r.ReviewerId == userId)
            .OrderByDescending(r => r.ReviewPosted)
            .ProjectTo<ReviewDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }
}
