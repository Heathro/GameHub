using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using API.Entities;
using API.Interfaces;
using API.DTOs;
using API.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http.HttpResults;

namespace API.Data;

public class UsersRepository : IUsersRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    private readonly IMessagesRepository _messagesRepository;
    private readonly UserManager<AppUser> _userManager;

    public UsersRepository(DataContext context, IMapper mapper, 
        IMessagesRepository messagesRepository, UserManager<AppUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _messagesRepository = messagesRepository;
        _userManager = userManager;
    }

    public async Task<PlayerDto> GetPlayerAsync(string username)
    {
        return await _context.Users
            .Where(u => u.UserName == username)
            .ProjectTo<PlayerDto>(_mapper.ConfigurationProvider)
            .SingleOrDefaultAsync();
    }

    public async Task<PagedList<PlayerDto>> GetPlayersAsync(
        PaginationParams paginationParams, string currentUsername)
    {
        var query = _context.Users.AsQueryable();

        query = query.Where(u => u.UserName != currentUsername && u.UserName != "Admin");

        query = paginationParams.OrderBy switch
        {
            "za" => query.OrderByDescending(u => u.UserName),
            _ => query.OrderBy(u => u.UserName)
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
        return await _context.Users
            .SingleOrDefaultAsync(user => user.Id == id);
    }

    public async Task<AppUser> GetUserByUsernameAsync(string username)
    {
        return await _context.Users
            .Include(a => a.Avatar)
            .SingleOrDefaultAsync(user => user.UserName == username);
    }

    public async Task<IEnumerable<AppUser>> GetUsersAsync()
    {
        return await _context.Users
            .Include(a => a.Avatar)
            .ToListAsync();
    }

    public async Task DeleteUser(string username)
    {
        await _messagesRepository.DeleteUserMessages(username);
        await _messagesRepository.SaveAllAsync();

        var user = await GetUserByUsernameAsync(username);
        await _userManager.DeleteAsync(user);
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
