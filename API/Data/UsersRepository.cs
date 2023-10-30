using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.DTOs;
using API.Helpers;

namespace API.Data;

public class UsersRepository : IUsersRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public UsersRepository(DataContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PlayerDto> GetPlayerAsync(string username)
    {
        return await _context.Users
            .Where(u => u.Username == username)
            .ProjectTo<PlayerDto>(_mapper.ConfigurationProvider)
            .SingleOrDefaultAsync();
    }

    public async Task<PagedList<PlayerDto>> GetPlayersAsync(
        PaginationParams paginationParams, string currentUsername)
    {
        var query = _context.Users.AsQueryable();

        query = query.Where(u => u.Username != currentUsername);

        query = paginationParams.OrderBy switch
        {
            "z-a" => query.OrderByDescending(u => u.Username),
            _ => query.OrderBy(u => u.Username)
        };

        return await PagedList<PlayerDto>.CreateAsync
        (
            query.ProjectTo<PlayerDto>(_mapper.ConfigurationProvider).AsNoTracking(), 
            paginationParams.CurrentPage, 
            paginationParams.ItemsPerPage
        );
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<AppUser> GetUserByUsernameAsync(string username)
    {
        return await _context.Users
            .Include(a => a.Avatar)
            .SingleOrDefaultAsync(user => user.Username == username);
    }

    public async Task<IEnumerable<AppUser>> GetUsersAsync()
    {
        return await _context.Users
            .Include(a => a.Avatar)
            .ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public void Update(AppUser user)
    {
        _context.Entry(user).State = EntityState.Modified;
    }
}
