using WorkoutTracker.Domain.Common;

namespace WorkoutTracker.Domain.Workouts;

public sealed class Workout
{
    public Guid Id { get; private set; }
    public string UserId { get; private set; } = default!;

    public WorkoutType Type { get; private set; }
    public DateOnly StartedAt { get; private set; }

    public TimeSpan Duration { get; private set; }
    public int? CaloriesBurned { get; private set; }
    public int Intensity { get; private set; }
    public int Fatigue { get; private set; }
    public string? Notes { get; private set; }

    private Workout() { }

    private Workout(
        Guid id,
        string userId,
        WorkoutType type,
        DateOnly startedAt,
        TimeSpan duration,
        int? caloriesBurned,
        int intensity,
        int fatigue,
        string? notes)
    {
        Id = id;
        UserId = userId;

        Type = type;
        StartedAt = startedAt;
        Duration = duration;
        CaloriesBurned = caloriesBurned;
        Intensity = intensity;
        Fatigue = fatigue;
        Notes = notes;
    }

    public static Workout Create(
        string userId,
        WorkoutType type,
        DateOnly startedAt,
        TimeSpan duration,
        int intensity,
        int fatigue,
        int? caloriesBurned = null,
        string? notes = null,
        Guid? id = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new DomainException("UserId is required.");

        if (duration <= TimeSpan.Zero)
            throw new DomainException("Duration must be greater than 0.");

        ValidateScale(intensity, nameof(intensity));
        ValidateScale(fatigue, nameof(fatigue));

        if (caloriesBurned is < 0)
            throw new DomainException("CaloriesBurned cannot be negative.");

        if (notes is not null && notes.Length > 2000)
            throw new DomainException("Notes is too long (max 2000 characters).");

        return new Workout(
            id ?? Guid.NewGuid(),
            userId,
            type,
            startedAt,
            duration,
            caloriesBurned,
            intensity,
            fatigue,
            notes);
    }

    public void Update(
        WorkoutType type,
        DateOnly startedAt,
        TimeSpan duration,
        int intensity,
        int fatigue,
        int? caloriesBurned = null,
        string? notes = null)
    {
        if (duration <= TimeSpan.Zero)
            throw new DomainException("Duration must be greater than 0.");

        ValidateScale(intensity, nameof(intensity));
        ValidateScale(fatigue, nameof(fatigue));

        if (caloriesBurned is < 0)
            throw new DomainException("CaloriesBurned cannot be negative.");

        if (notes is not null && notes.Length > 2000)
            throw new DomainException("Notes is too long (max 2000 characters).");

        Type = type;
        StartedAt = startedAt;
        Duration = duration;
        Intensity = intensity;
        Fatigue = fatigue;
        CaloriesBurned = caloriesBurned;
        Notes = notes;
    }

    private static void ValidateScale(int value, string fieldName)
    {
        if (value is < 1 or > 10)
            throw new DomainException($"{fieldName} must be between 1 and 10.");
    }
}
