using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed class CreateWorkoutCommand
{
    public WorkoutType Type { get; init; }
    public DateTimeOffset StartedAt { get; init; }
    public int DurationMinutes { get; init; }
    public int Intensity { get; init; } 
    public int Fatigue { get; init; }  
    public int? CaloriesBurned { get; init; }
    public string? Notes { get; init; }
}
