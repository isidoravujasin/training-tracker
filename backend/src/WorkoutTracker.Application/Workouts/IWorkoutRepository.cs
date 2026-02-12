using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public interface IWorkoutRepository
{
    Task AddAsync(Workout workout, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);

    Task<IReadOnlyList<Workout>> GetAsync(
        string userId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        string sortBy,
        string sortDir,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<int> CountAsync(
        string userId,
        DateTimeOffset? from,
        DateTimeOffset? to,
        CancellationToken ct = default);

    public sealed record WeeklyStatsRow(
        DateOnly WeekStart,
        int TotalWorkouts,
        int TotalDurationMinutes,
        double AvgIntensity,
        double AvgFatigue);

    Task<IReadOnlyList<WeeklyStatsRow>> GetWeeklyStatsAsync(
        string userId,
        DateOnly month,
        CancellationToken ct = default);

    Task<Workout?> GetByIdAsync(Guid id, string userId, CancellationToken ct = default);

    Task<Workout?> GetByIdForUpdateAsync(Guid id, string userId, CancellationToken ct = default);

    void Remove(Workout workout);
}
