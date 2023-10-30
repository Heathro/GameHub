namespace API.Helpers;

public class UsersParams
{
    private const int MaxItemsPerPage = 50;
    private int _itemsPerPage = 12;
    public int ItemsPerPage
    {
        get => _itemsPerPage;
        set => _itemsPerPage = (value > MaxItemsPerPage) ? MaxItemsPerPage : value;
    }
    public int CurrentPage { get; set; } = 1;
    public string CurrentUsername { get; set; }
}
