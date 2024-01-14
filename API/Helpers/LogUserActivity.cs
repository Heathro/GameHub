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
        var unitOfWork = resultContext.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();
        var user = await unitOfWork.UsersRepository.GetUserByIdAsync(userId);
        
        if (user != null) user.LastActive = DateTime.UtcNow;
        
        await unitOfWork.Complete();
    }
}
