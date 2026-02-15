using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed class CreateWorkoutCommand
{
    public required string UserId { get; init; }
    public WorkoutType Type { get; init; }
    public DateOnly StartedAt { get; init; }
    public TimeOnly? Time { get; init; }

    public int DurationMinutes { get; init; }
    public int Intensity { get; init; }
    public int Fatigue { get; init; }
    public int? CaloriesBurned { get; init; }
    public string? Notes { get; init; }
}
