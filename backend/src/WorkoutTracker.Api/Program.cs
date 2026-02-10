var builder = WebApplication.CreateBuilder(args);

// Controllers 
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();


app.MapGet("/weatherforecast", () =>
{
    var summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild",
        "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    var forecast = Enumerable.Range(1, 5).Select(index =>
        new
        {
            date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            temperatureC = Random.Shared.Next(-20, 55),
            summary = summaries[Random.Shared.Next(summaries.Length)]
        })
        .ToArray();

    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();
