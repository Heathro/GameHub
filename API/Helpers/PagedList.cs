using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class PagedList<T> : List<T>
{
    public int CurrentPage { get; set; }
    public int ItemsPerPage { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }

    public PagedList(IEnumerable<T> items, int totalItems, int currentPage, int itemsPerPage)
    {
        CurrentPage = currentPage;
        ItemsPerPage = itemsPerPage;
        TotalItems = totalItems;
        TotalPages = (int)Math.Ceiling(totalItems / (double)itemsPerPage);
        AddRange(items);
    }

    public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source,
        int currentPage, int itemsPerPage)
    {
        var totalItems = await source.CountAsync();
        var items = await source.Skip((currentPage - 1) * itemsPerPage).Take(itemsPerPage).ToListAsync();
        return new PagedList<T>(items, totalItems, currentPage, itemsPerPage);
    }
}
