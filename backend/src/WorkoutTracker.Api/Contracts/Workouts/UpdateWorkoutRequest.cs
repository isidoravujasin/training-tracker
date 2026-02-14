using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Api.Contracts.Workouts;

public sealed record UpdateWorkoutRequest(
    WorkoutType Type,
    string StartedAt, 
    int DurationMinutes,
    int Intensity,
    int Fatigue,
    int? CaloriesBurned,
    string? Notes
);
