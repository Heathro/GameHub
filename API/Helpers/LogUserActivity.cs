using Microsoft.AspNetCore.Mvc.Filters;
using API.Extensions;
using API.Interfaces;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next();

        if (!resultContext.HttpContext.User.Identity.IsAuthenticated) return;

        var userId = resultContext.HttpContext.User.GetUserId();
        var userRepository = resultContext.HttpContext.RequestServices.GetRequiredService<IUsersRepository>();
        var user = await userRepository.GetUserByIdAsync(userId);
        
        if (user != null) user.LastActive = DateTime.UtcNow;
        
        await userRepository.SaveAllAsync();
    }
}
