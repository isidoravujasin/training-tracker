using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public interface IWorkoutRepository
{
    Task AddAsync(Workout workout, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
