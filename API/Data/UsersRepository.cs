using Microsoft.EntityFrameworkCore;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.DTOs;

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

    public async Task<IEnumerable<PlayerDto>> GetPlayersAsync()
    {
        return await _context.Users
            .ProjectTo<PlayerDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        return await _context.Users
            .Include(a => a.Avatar)
            .SingleOrDefaultAsync(user => user.Id == id);
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
