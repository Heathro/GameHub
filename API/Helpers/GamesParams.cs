using API.DTOs;

namespace API.Helpers;

public class GamesParams
{
    private const int MaxItemsPerPage = 50;
    private int _itemsPerPage = 12;
    public int ItemsPerPage
    {
        get => _itemsPerPage;
        set => _itemsPerPage = (value > MaxItemsPerPage) ? MaxItemsPerPage : value;
    }
    public int CurrentPage { get; set; } = 1;
    public bool Windows { get; set; } = false;
    public bool Macos { get; set; } = false;
    public bool Linux { get; set; } = false;
}
