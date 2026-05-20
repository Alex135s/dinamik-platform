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

// GET todos los documentos
app.MapGet("/api/documents", async () =>
{
    var docs = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, project_id, name, type, file_url, enabled, uploaded_at FROM documents ORDER BY uploaded_at DESC", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        docs.Add(new
        {
            id = reader.GetGuid(0),
            projectId = reader.GetGuid(1),
            name = reader.GetString(2),
            type = reader.IsDBNull(3) ? null : reader.GetString(3),
            fileUrl = reader.IsDBNull(4) ? null : reader.GetString(4),
            enabled = reader.GetBoolean(5),
            uploadedAt = reader.GetDateTime(6)
        });
    }
    return Results.Ok(docs);
});

// GET documentos por proyecto
app.MapGet("/api/documents/project/{projectId}", async (string projectId) =>
{
    var docs = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, project_id, name, type, file_url, enabled, uploaded_at FROM documents WHERE project_id = @projectId ORDER BY uploaded_at DESC", conn);
    cmd.Parameters.AddWithValue("projectId", Guid.Parse(projectId));
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        docs.Add(new
        {
            id = reader.GetGuid(0),
            projectId = reader.GetGuid(1),
            name = reader.GetString(2),
            type = reader.IsDBNull(3) ? null : reader.GetString(3),
            fileUrl = reader.IsDBNull(4) ? null : reader.GetString(4),
            enabled = reader.GetBoolean(5),
            uploadedAt = reader.GetDateTime(6)
        });
    }
    return Results.Ok(docs);
});

// POST crear documento
app.MapPost("/api/documents", async (DocumentRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "INSERT INTO documents (project_id, name, type, file_url, enabled) VALUES (@projectId, @name, @type, @fileUrl, @enabled) RETURNING id", conn);
    cmd.Parameters.AddWithValue("projectId", Guid.Parse(req.ProjectId));
    cmd.Parameters.AddWithValue("name", req.Name);
    cmd.Parameters.AddWithValue("type", req.Type ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("fileUrl", req.FileUrl ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("enabled", req.Enabled ?? true);
    var id = await cmd.ExecuteScalarAsync();
    return Results.Ok(new { id });
});
// PATCH toggle enabled
app.MapPatch("/api/documents/{id}/toggle", async (string id, ToggleRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "UPDATE documents SET enabled = @enabled WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("enabled", req.Enabled);
    cmd.Parameters.AddWithValue("id", Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});

app.Run();

record DocumentRequest(string ProjectId, string Name, string? Type, string? FileUrl, bool? Enabled);
record ToggleRequest(bool Enabled);