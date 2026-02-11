using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WorkoutsController : ControllerBase
{
    private readonly CreateWorkoutHandler _createWorkout;

    public WorkoutsController(CreateWorkoutHandler createWorkout)
    {
        _createWorkout = createWorkout;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CreateWorkoutResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateWorkoutRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Missing user identity." });

        var command = new CreateWorkoutCommand
        {
            UserId = userId,
            Type = request.Type,
            StartedAt = request.StartedAt,
            DurationMinutes = request.DurationMinutes,
            Intensity = request.Intensity,
            Fatigue = request.Fatigue,
            CaloriesBurned = request.CaloriesBurned,
            Notes = request.Notes
        };

        var workoutId = await _createWorkout.Handle(command, ct);

        return Created($"/api/workouts/{workoutId}", new CreateWorkoutResponse(workoutId));
    }
}

public sealed class CreateWorkoutRequest
{
    public WorkoutType Type { get; init; }
    public DateTimeOffset StartedAt { get; init; }
    public int DurationMinutes { get; init; }
    public int Intensity { get; init; }
    public int Fatigue { get; init; }
    public int? CaloriesBurned { get; init; }
    public string? Notes { get; init; }
}

public sealed class CreateWorkoutResponse
{
    public Guid WorkoutId { get; }

    public CreateWorkoutResponse(Guid workoutId)
    {
        WorkoutId = workoutId;
    }
}
