using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkoutTracker.Application.Progress;

namespace WorkoutTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProgressController : ControllerBase
{
    private readonly GetMonthlyProgressHandler _handler;

    public ProgressController(GetMonthlyProgressHandler handler) => _handler = handler;

    [HttpGet("monthly")]
    [Authorize]
    public async Task<IActionResult> GetMonthly([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
    {
        if (year < 2000 || year > 2100) return BadRequest(new { error = "Invalid year." });
        if (month < 1 || month > 12) return BadRequest(new { error = "Invalid month." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var result = await _handler.Handle(userId, year, month, ct);
        return Ok(result);
    }
}
