using AutoMapper;
using API.Interfaces;

namespace API.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public UnitOfWork(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public IUsersRepository UsersRepository => new UsersRepository(_context, _mapper);
    
    public IFriendsRepository FriendsRepository => new FriendsRepository(_context, _mapper);

    public IMessagesRepository MessagesRepository => new MessagesRepository(_context, _mapper);

    public IGamesRepository GamesRepository => new GamesRepository(_context, _mapper);

    public IReviewsRepository ReviewsRepository => new ReviewsRepository(_context, _mapper);

    public IBookmarksRepository BookmarksRepository => new BookmarksRepository(_context);

    public ILikesRepository LikesRepository => new LikesRepository(_context);

    public bool HasChanges()
    {
        return _context.ChangeTracker.HasChanges();
    }

    public async Task<bool> Complete()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}