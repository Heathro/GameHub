namespace API.Interfaces;

public interface IUnitOfWork
{
    public IUsersRepository UsersRepository { get; }
    public IFriendsRepository FriendsRepository { get; }
    public IMessagesRepository MessagesRepository { get; }
    public IGamesRepository GamesRepository { get; }
    public IReviewsRepository ReviewsRepository { get; }
    public IBookmarksRepository BookmarksRepository { get; }
    public ILikesRepository LikesRepository { get; }    
    bool HasChanges();
    Task<bool> Complete();
}
