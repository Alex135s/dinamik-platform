using Microsoft.AspNetCore.Builder;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

string connStr = "Host=localhost;Port=5432;Database=dinamik_db;Username=postgres;Password=1234";

// GET todos los proyectos
app.MapGet("/api/projects", async () =>
{
    var projects = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, name, client, service_type, status, start_date, created_at FROM projects ORDER BY created_at DESC", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        projects.Add(new
        {
            id = reader.GetGuid(0),
            name = reader.GetString(1),
            client = reader.IsDBNull(2) ? null : reader.GetString(2),
            serviceType = reader.IsDBNull(3) ? null : reader.GetString(3),
            status = reader.IsDBNull(4) ? null : reader.GetString(4),
            startDate = reader.IsDBNull(5) ? null : reader.GetDateTime(5).ToString("yyyy-MM-dd"),
            createdAt = reader.GetDateTime(6)
        });
    }
    return Results.Ok(projects);
});

// POST crear proyecto
app.MapPost("/api/projects", async (ProjectRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "INSERT INTO projects (name, client, service_type, status, start_date) VALUES (@name, @client, @serviceType, @status, @startDate) RETURNING id", conn);
    cmd.Parameters.AddWithValue("name", req.Name);
    cmd.Parameters.AddWithValue("client", req.Client ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("serviceType", req.ServiceType ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("status", req.Status ?? "activo");
    cmd.Parameters.AddWithValue("startDate", req.StartDate.HasValue ? req.StartDate.Value : DBNull.Value);
    var id = await cmd.ExecuteScalarAsync();
    return Results.Ok(new { id });
});

app.Run();

record ProjectRequest(string Name, string? Client, string? ServiceType, string? Status, DateOnly? StartDate);