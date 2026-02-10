using Microsoft.AspNetCore.Mvc;
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
    [ProducesResponseType(typeof(CreateWorkoutResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public IActionResult Create([FromBody] CreateWorkoutRequest request)
    {
        var command = new CreateWorkoutCommand
        {
            Type = request.Type,
            StartedAt = request.StartedAt,
            DurationMinutes = request.DurationMinutes,
            Intensity = request.Intensity,
            Fatigue = request.Fatigue,
            CaloriesBurned = request.CaloriesBurned,
            Notes = request.Notes
        };

        var result = _createWorkout.Handle(command);

        return Created($"/api/workouts/{result.WorkoutId}", new CreateWorkoutResponse(result.WorkoutId));
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
