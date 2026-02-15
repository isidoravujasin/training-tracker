using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed record UpdateWorkoutCommand(
    Guid WorkoutId,
    string UserId,
    WorkoutType Type,
    DateOnly StartedAt,
    TimeOnly? Time,
    int DurationMinutes,
    int Intensity,
    int Fatigue,
    int? CaloriesBurned,
    string? Notes);

public sealed class UpdateWorkoutHandler
{
    private readonly IWorkoutRepository _repo;
    public UpdateWorkoutHandler(IWorkoutRepository repo) => _repo = repo;

    public async Task<WorkoutDto?> Handle(UpdateWorkoutCommand cmd, CancellationToken ct = default)
    {
        var workout = await _repo.GetByIdForUpdateAsync(cmd.WorkoutId, cmd.UserId, ct);
        if (workout is null) return null;

        workout.Update(
            cmd.Type,
            cmd.StartedAt,
            cmd.Time,
            TimeSpan.FromMinutes(cmd.DurationMinutes),
            cmd.Intensity,
            cmd.Fatigue,
            cmd.CaloriesBurned,
            cmd.Notes);

        await _repo.SaveChangesAsync(ct);

        return new WorkoutDto(
            workout.Id,
            workout.Type,
            workout.StartedAt,
            workout.Time?.ToString("HH:mm"),
            (int)Math.Round(workout.Duration.TotalMinutes),
            workout.Intensity,
            workout.Fatigue,
            workout.CaloriesBurned,
            workout.Notes
        );
    }
}
