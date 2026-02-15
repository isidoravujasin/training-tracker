using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts;

public sealed class GetWorkoutsHandler
{
    private readonly IWorkoutRepository _repo;

    public GetWorkoutsHandler(IWorkoutRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<WorkoutDto>> Handle(
        GetWorkoutsQuery query,
        CancellationToken ct = default)
    {
        var totalCount = await _repo.CountAsync(
            query.UserId,
            query.From,
            query.To,
            ct);

        var workouts = await _repo.GetAsync(
            query.UserId,
            query.From,
            query.To,
            query.SortBy,
            query.SortDir,
            query.Page,
            query.PageSize,
            ct);

        var items = workouts.Select(w => new WorkoutDto(
            w.Id,
            w.Type,
            w.StartedAt, 
            w.Time?.ToString("HH:mm"),
            (int)Math.Round(w.Duration.TotalMinutes),
            w.Intensity,
            w.Fatigue,
            w.CaloriesBurned,
            w.Notes
        )).ToList();

        return new PagedResult<WorkoutDto>(
            query.Page,
            query.PageSize,
            totalCount,
            items);
    }
}

public sealed record GetWorkoutsQuery(
    string UserId,
    DateOnly? From,  
    DateOnly? To,  
    string SortBy = "startedAt",
    string SortDir = "desc",
    int Page = 1,
    int PageSize = 20);

public sealed record WorkoutDto(
    Guid Id,
    WorkoutType Type,
    DateOnly StartedAt,  
    string? StartedTime, 
    int DurationMinutes,
    int Intensity,
    int Fatigue,
    int? CaloriesBurned,
    string? Notes);

public sealed record PagedResult<T>(
    int Page,
    int PageSize,
    int TotalCount,
    IReadOnlyList<T> Items)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
