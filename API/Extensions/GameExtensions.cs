using API.Entities;

namespace API.Extensions;

public static class GameExtensions
{
    public static List<int> GetLikedUsers(this Game game)
    {
        List<int> likedUsers = new();
        foreach (Like like in game.LikedUsers)
        {
            likedUsers.Add(like.SourceUserId);
        }
        return likedUsers;
    }
}
