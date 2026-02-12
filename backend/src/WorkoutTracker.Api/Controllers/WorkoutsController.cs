using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Api.Contracts.Workouts;

namespace WorkoutTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class WorkoutsController : ControllerBase
{
    private readonly CreateWorkoutHandler _createWorkout;
    private readonly GetWorkoutsHandler _getWorkouts;
    private readonly GetWorkoutByIdHandler _getById;
    private readonly UpdateWorkoutHandler _update;
    private readonly DeleteWorkoutHandler _delete;

    public WorkoutsController(
        CreateWorkoutHandler createWorkout,
        GetWorkoutsHandler getWorkouts,
        GetWorkoutByIdHandler getById,
        UpdateWorkoutHandler update,
        DeleteWorkoutHandler delete)
    {
        _createWorkout = createWorkout;
        _getWorkouts = getWorkouts;
        _getById = getById;
        _update = update;
        _delete = delete;
    }

    // ---------------- CREATE ----------------

    [HttpPost]
    [ProducesResponseType(typeof(CreateWorkoutResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create(
        [FromBody] CreateWorkoutRequest request,
        CancellationToken ct)
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

        return Created(
            $"/api/workouts/{workoutId}",
            new CreateWorkoutResponse(workoutId));
    }


    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<WorkoutDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] string sortBy = "startedAt",
        [FromQuery] string sortDir = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var result = await _getWorkouts.Handle(
            new GetWorkoutsQuery(
                userId,
                from,
                to,
                sortBy,
                sortDir,
                page,
                pageSize),
            ct);

        return Ok(result);
    }


    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(WorkoutDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var dto = await _getById.Handle(id, userId, ct);
        if (dto is null)
            return NotFound();

        return Ok(dto);
    }


    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(WorkoutDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateWorkoutRequest request,
        CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var dto = await _update.Handle(
            new UpdateWorkoutCommand(
                id,
                userId,
                request.Type,
                request.StartedAt,
                request.DurationMinutes,
                request.Intensity,
                request.Fatigue,
                request.CaloriesBurned,
                request.Notes),
            ct);

        if (dto is null)
            return NotFound();

        return Ok(dto);
    }


    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var deleted = await _delete.Handle(id, userId, ct);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
