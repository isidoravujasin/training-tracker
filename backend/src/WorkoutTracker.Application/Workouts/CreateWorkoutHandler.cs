using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed class CreateWorkoutHandler
{
    public CreateWorkoutResult Handle(CreateWorkoutCommand command)
    {
        var workout = Workout.Create(
            type: command.Type,
            startedAt: command.StartedAt,
            duration: TimeSpan.FromMinutes(command.DurationMinutes),
            intensity: command.Intensity,
            fatigue: command.Fatigue,
            caloriesBurned: command.CaloriesBurned,
            notes: command.Notes
        );

        return new CreateWorkoutResult(workout.Id);
    }
}
