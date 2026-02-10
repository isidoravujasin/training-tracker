namespace WorkoutTracker.Application.Workouts;

public sealed class CreateWorkoutResult
{
    public Guid WorkoutId { get; init; }

    public CreateWorkoutResult(Guid workoutId)
    {
        WorkoutId = workoutId;
    }
}
