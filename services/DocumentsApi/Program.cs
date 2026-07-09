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

// DELETE documento
app.MapDelete("/api/documents/{id}", async (string id) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "DELETE FROM documents WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("id", Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});


// ════════════════════════════════════════════════════════════
//  GALERÍA DEL PORTAFOLIO (fotos de obra por categoría)
// ════════════════════════════════════════════════════════════

// GET todas las fotos de la galería (para el panel admin)
app.MapGet("/api/gallery", async () =>
{
    var items = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, title, category, image_url, enabled, uploaded_at, position FROM gallery ORDER BY position ASC, uploaded_at DESC", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        items.Add(new
        {
            id         = reader.GetGuid(0),
            title      = reader.GetString(1),
            category   = reader.GetString(2),
            imageUrl   = reader.GetString(3),
            enabled    = reader.GetBoolean(4),
            uploadedAt = reader.GetDateTime(5),
            position   = reader.IsDBNull(6) ? 0 : reader.GetInt32(6)
        });
    }
    return Results.Ok(items);
});

// GET solo las fotos habilitadas (para el portafolio público)
app.MapGet("/api/gallery/public", async () =>
{
    var items = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, title, category, image_url, uploaded_at, position FROM gallery WHERE enabled = TRUE ORDER BY position ASC, uploaded_at DESC", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        items.Add(new
        {
            id         = reader.GetGuid(0),
            title      = reader.GetString(1),
            category   = reader.GetString(2),
            imageUrl   = reader.GetString(3),
            uploadedAt = reader.GetDateTime(4),
            position   = reader.IsDBNull(5) ? 0 : reader.GetInt32(5)
        });
    }
    return Results.Ok(items);
});

// POST agregar foto a la galería
app.MapPost("/api/gallery", async (GalleryRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "INSERT INTO gallery (title, category, image_url, enabled) VALUES (@title, @category, @imageUrl, @enabled) RETURNING id", conn);
    cmd.Parameters.AddWithValue("title",    req.Title);
    cmd.Parameters.AddWithValue("category", req.Category);
    cmd.Parameters.AddWithValue("imageUrl", req.ImageUrl);
    cmd.Parameters.AddWithValue("enabled",  req.Enabled ?? true);
    var id = await cmd.ExecuteScalarAsync();
    return Results.Ok(new { id });
});

// PATCH mostrar/ocultar foto en el portafolio
app.MapPatch("/api/gallery/{id}/toggle", async (string id, GalleryToggleRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "UPDATE gallery SET enabled = @enabled WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("enabled", req.Enabled);
    cmd.Parameters.AddWithValue("id",      Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});

// DELETE quitar foto de la galería
app.MapDelete("/api/gallery/{id}", async (string id) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "DELETE FROM gallery WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("id", Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});


// PATCH reordenar fotos de un álbum (recibe los ids en el nuevo orden)
app.MapPatch("/api/gallery/reorder", async (ReorderRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    for (int i = 0; i < req.Ids.Count; i++)
    {
        await using var cmd = new NpgsqlCommand(
            "UPDATE gallery SET position = @pos WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("pos", i);
        cmd.Parameters.AddWithValue("id", Guid.Parse(req.Ids[i]));
        await cmd.ExecuteNonQueryAsync();
    }
    return Results.Ok(new { success = true });
});

app.Run();

record DocumentRequest(string ProjectId, string Name, string? Type, string? FileUrl, bool? Enabled);
record ToggleRequest(bool Enabled);
record GalleryRequest(string Title, string Category, string ImageUrl, bool? Enabled);
record GalleryToggleRequest(bool Enabled);
record ReorderRequest(List<string> Ids);