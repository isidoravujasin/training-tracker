using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed class CreateWorkoutHandler
{
    private readonly IWorkoutRepository _repo;

    public CreateWorkoutHandler(IWorkoutRepository repo) => _repo = repo;

    public async Task<Guid> Handle(CreateWorkoutCommand command, CancellationToken ct = default)
    {
        var workout = Workout.Create(
            userId: command.UserId,
            type: command.Type,
            startedAt: command.StartedAt,
            duration: TimeSpan.FromMinutes(command.DurationMinutes),
            intensity: command.Intensity,
            fatigue: command.Fatigue,
            caloriesBurned: command.CaloriesBurned,
            notes: command.Notes
        );

        await _repo.AddAsync(workout, ct);
        await _repo.SaveChangesAsync(ct);

        return workout.Id;
    }
}
