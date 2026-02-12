using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed class GetWorkoutByIdHandler
{
    private readonly IWorkoutRepository _repo;

    public GetWorkoutByIdHandler(IWorkoutRepository repo) => _repo = repo;

    public async Task<WorkoutDto?> Handle(Guid id, string userId, CancellationToken ct = default)
    {
        var workout = await _repo.GetByIdAsync(id, userId, ct);
        if (workout is null) return null;

        return new WorkoutDto(
            workout.Id,
            workout.Type,
            workout.StartedAt,
            (int)Math.Round(workout.Duration.TotalMinutes),
            workout.Intensity,
            workout.Fatigue,
            workout.CaloriesBurned,
            workout.Notes
        );
    }
}
