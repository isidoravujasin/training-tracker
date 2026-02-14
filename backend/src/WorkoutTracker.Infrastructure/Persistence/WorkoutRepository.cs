using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Infrastructure.Persistence;

public sealed class WorkoutRepository : IWorkoutRepository
{
    private readonly AppDbContext _db;

    public WorkoutRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(Workout workout, CancellationToken ct = default)
        => await _db.Workouts.AddAsync(workout, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);

    public async Task<IReadOnlyList<Workout>> GetAsync(
        string userId,
        DateOnly? from,
        DateOnly? to,
        string sortBy,
        string sortDir,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = _db.Workouts
            .AsNoTracking()
            .Where(w => w.UserId == userId);

        if (from.HasValue)
            query = query.Where(w => w.StartedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(w => w.StartedAt <= to.Value);

        sortBy = sortBy?.ToLower() ?? "startedat";
        sortDir = sortDir?.ToLower() ?? "desc";

        query = sortBy switch
        {
            "startedat" => sortDir == "asc"
                ? query.OrderBy(w => w.StartedAt)
                : query.OrderByDescending(w => w.StartedAt),

            _ => query.OrderByDescending(w => w.StartedAt)
        };

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> CountAsync(
        string userId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct = default)
    {
        var query = _db.Workouts
            .AsNoTracking()
            .Where(w => w.UserId == userId);

        if (from.HasValue)
            query = query.Where(w => w.StartedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(w => w.StartedAt <= to.Value);

        return await query.CountAsync(ct);
    }

    public async Task<IReadOnlyList<IWorkoutRepository.WeeklyStatsRow>> GetWeeklyStatsAsync(
        string userId,
        DateOnly month,
        CancellationToken ct = default)
    {
        var monthStart = new DateOnly(month.Year, month.Month, 1);
        var monthEnd = monthStart.AddMonths(1);

        var raw = await _db.Workouts
            .AsNoTracking()
            .Where(w => w.UserId == userId &&
                        w.StartedAt >= monthStart &&
                        w.StartedAt < monthEnd)
            .Select(w => new
            {
                w.StartedAt,
                DurationMinutes = (int)w.Duration.TotalMinutes,
                w.Intensity,
                w.Fatigue
            })
            .ToListAsync(ct);

        static DateOnly WeekStartMonday(DateOnly date)
        {
            var dow = (int)date.DayOfWeek;   
            var delta = dow == 0 ? 6 : dow - 1;
            return date.AddDays(-delta);
        }

        return raw
            .GroupBy(x => WeekStartMonday(x.StartedAt))
            .OrderBy(g => g.Key)
            .Select(g => new IWorkoutRepository.WeeklyStatsRow(
                WeekStart: g.Key,
                TotalWorkouts: g.Count(),
                TotalDurationMinutes: g.Sum(x => x.DurationMinutes),
                AvgIntensity: g.Average(x => x.Intensity),
                AvgFatigue: g.Average(x => x.Fatigue)
            ))
            .ToList();
    }

    public Task<Workout?> GetByIdAsync(Guid id, string userId, CancellationToken ct = default)
        => _db.Workouts
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId, ct);

    public Task<Workout?> GetByIdForUpdateAsync(Guid id, string userId, CancellationToken ct = default)
        => _db.Workouts
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId, ct);

    public void Remove(Workout workout)
        => _db.Workouts.Remove(workout);
}
