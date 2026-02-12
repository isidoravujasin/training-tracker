
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Api.Contracts.Workouts;

public sealed record CreateWorkoutRequest(
    WorkoutType Type,
    DateTimeOffset StartedAt,
    int DurationMinutes,
    int Intensity,
    int Fatigue,
    int? CaloriesBurned,
    string? Notes
);
