namespace WorkoutTracker.Application.Workouts;

public sealed class DeleteWorkoutHandler
{
    private readonly IWorkoutRepository _repo;
    public DeleteWorkoutHandler(IWorkoutRepository repo) => _repo = repo;

    public async Task<bool> Handle(Guid workoutId, string userId, CancellationToken ct = default)
    {
        var workout = await _repo.GetByIdForUpdateAsync(workoutId, userId, ct);
        if (workout is null) return false;

        _repo.Remove(workout);
        await _repo.SaveChangesAsync(ct);
        return true;
    }
}
