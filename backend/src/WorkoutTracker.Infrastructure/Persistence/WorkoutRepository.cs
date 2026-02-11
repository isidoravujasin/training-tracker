using WorkoutTracker.Application.Workouts;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Infrastructure.Persistence;

namespace WorkoutTracker.Infrastructure.Persistence;

public sealed class WorkoutRepository : IWorkoutRepository
{
    private readonly AppDbContext _db;

    public WorkoutRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(Workout workout, CancellationToken ct = default)
        => await _db.Workouts.AddAsync(workout, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);
}
