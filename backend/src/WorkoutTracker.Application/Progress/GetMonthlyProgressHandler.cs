namespace WorkoutTracker.Application.Progress;

public sealed class GetMonthlyProgressHandler
{
    private readonly Workouts.IWorkoutRepository _repo;

    public GetMonthlyProgressHandler(Workouts.IWorkoutRepository repo)
    {
        _repo = repo;
    }

    public async Task<MonthlyProgressResult> Handle(
        string userId,
        int year,
        int month,
        CancellationToken ct = default)
    {
        var monthStart = new DateOnly(year, month, 1);
        var monthEndExclusive = monthStart.AddMonths(1);

        var rows = await _repo.GetWeeklyStatsAsync(userId, monthStart, ct);

        var map = rows.ToDictionary(r => r.WeekStart);

        var allWeekStarts = GetWeekStartsCoveringMonth(monthStart, monthEndExclusive);

        var weeks = allWeekStarts.Select(weekStart =>
        {
            if (map.TryGetValue(weekStart, out var r))
            {
                return new WeeklyProgressDto(
                    WeekStart: r.WeekStart,
                    WorkoutCount: r.TotalWorkouts,
                    TotalDurationMinutes: r.TotalDurationMinutes,
                    AvgIntensity: r.AvgIntensity,
                    AvgFatigue: r.AvgFatigue
                );
            }

            // Prazna nedelja
            return new WeeklyProgressDto(
                WeekStart: weekStart,
                WorkoutCount: 0,
                TotalDurationMinutes: 0,
                AvgIntensity: 0,
                AvgFatigue: 0
            );
        }).ToList();

        return new MonthlyProgressResult(
            Year: year,
            Month: month,
            Weeks: weeks
        );
    }

    private static List<DateOnly> GetWeekStartsCoveringMonth(DateOnly monthStart, DateOnly monthEndExclusive)
    {
        var firstWeekStart = StartOfWeekMonday(monthStart);

        var list = new List<DateOnly>();
        var current = firstWeekStart;

        while (current < monthEndExclusive)
        {
            list.Add(current);
            current = current.AddDays(7);
        }

        return list;
    }

    private static DateOnly StartOfWeekMonday(DateOnly date)
    {
        var dow = (int)date.DayOfWeek;
        var delta = dow == 0 ? 6 : dow - 1; 
        return date.AddDays(-delta);
    }
}

public sealed record MonthlyProgressResult(
    int Year,
    int Month,
    List<WeeklyProgressDto> Weeks);

public sealed record WeeklyProgressDto(
    DateOnly WeekStart,
    int WorkoutCount,
    int TotalDurationMinutes,
    double AvgIntensity,
    double AvgFatigue);
