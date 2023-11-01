namespace API.Helpers;

public class PaginationParams
{
    private const int MaxItemsPerPage = 50;
    private int _itemsPerPage = 12;
    public int ItemsPerPage
    {
        get => _itemsPerPage;
        set => _itemsPerPage = (value > MaxItemsPerPage) ? MaxItemsPerPage : value;
    }
    public int CurrentPage { get; set; } = 1;    
    public string OrderBy { get; set; } = "az";
}
