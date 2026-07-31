using Microsoft.AspNetCore.Builder;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Http.Json;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Puerto: en la nube (Render) se toma de la variable PORT; en local se usa el de siempre.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
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

// Conexión a la BD: en la nube viene de DATABASE_URL (Supabase); en local usa PostgreSQL local.
string connStr = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "Host=localhost;Port=5432;Database=dinamik_db;Username=postgres;Password=1234";
// Si DATABASE_URL viene como URL de Supabase (postgresql://...), la pasamos al formato de Npgsql.
if (connStr.StartsWith("postgres://") || connStr.StartsWith("postgresql://"))
{
    var uri = new Uri(connStr);
    var creds = uri.UserInfo.Split(':');
    connStr = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={uri.AbsolutePath.TrimStart('/')};" +
              $"Username={creds[0]};Password={Uri.UnescapeDataString(creds[1])};SSL Mode=Require;Trust Server Certificate=true";
}
string jwtKey  = "DinamikPlatform2026ClaveSecreta!!";

// Token de ApiPeru.dev para consulta de DNI/RUC (dejar vacío hasta configurarlo en Render / appsettings)
string apiPeruToken = builder.Configuration["ApiPeru:Token"] ?? "";
var httpApiPeru = new HttpClient();

string GenerarToken(string id, string name, string email, string role)
{
    var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim("id",    id),
        new Claim("name",  name),
        new Claim("email", email),
        new Claim("role",  role),
    };
    var token = new JwtSecurityToken(
        issuer: "DinamikPlatform",
        audience: "DinamikFrontend",
        claims: claims,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );
    return new JwtSecurityTokenHandler().WriteToken(token);
}


// 🔧 Función reutilizable: recalcula el progreso de un proyecto a partir de sus tareas
//    progress = (tareas completadas / total de tareas) * 100
//    Además sincroniza el estado del proyecto:
//      - si todas las tareas están completadas (y hay al menos una) -> "completado" + end_date hoy
//      - si el proyecto estaba "completado" pero ya no lo está -> vuelve a "en_proceso"
async Task RecalcularProgreso(NpgsqlConnection conn, Guid projectId)
{
    await using var cmdTotal = new NpgsqlCommand(
        "SELECT COUNT(*) FROM tasks WHERE project_id = @p", conn);
    cmdTotal.Parameters.AddWithValue("p", projectId);
    var total = (long)(await cmdTotal.ExecuteScalarAsync())!;

    await using var cmdDone = new NpgsqlCommand(
        "SELECT COUNT(*) FROM tasks WHERE project_id = @p AND status = 'completado'", conn);
    cmdDone.Parameters.AddWithValue("p", projectId);
    var completadas = (long)(await cmdDone.ExecuteScalarAsync())!;

    var progreso = total > 0 ? (int)Math.Round((double)completadas / total * 100) : 0;

    await using var cmdProgress = new NpgsqlCommand(
        "UPDATE projects SET progress = @progress WHERE id = @p", conn);
    cmdProgress.Parameters.AddWithValue("progress", progreso);
    cmdProgress.Parameters.AddWithValue("p", projectId);
    await cmdProgress.ExecuteNonQueryAsync();

    if (total > 0 && completadas == total)
    {
        // Todas completadas -> proyecto completado (solo si aún no lo estaba)
        await using var cmdDoneProj = new NpgsqlCommand(
            "UPDATE projects SET status = 'completado', end_date = CURRENT_DATE WHERE id = @p AND status != 'completado'", conn);
        cmdDoneProj.Parameters.AddWithValue("p", projectId);
        await cmdDoneProj.ExecuteNonQueryAsync();
    }
    else
    {
        // Quedan tareas pendientes -> si estaba completado, reabrirlo
        await using var cmdReopen = new NpgsqlCommand(
            "UPDATE projects SET status = 'en_proceso' WHERE id = @p AND status = 'completado'", conn);
        cmdReopen.Parameters.AddWithValue("p", projectId);
        await cmdReopen.ExecuteNonQueryAsync();
    }
}

// GET todos los proyectos
app.MapGet("/api/projects", async () =>
{
    var projects = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        @"SELECT id, name, client, service_type, status, start_date,
                 created_at, project_code, whatsapp, end_date, progress, assigned_to,
                 location, latitude, longitude, client_doc_type, client_doc_number
          FROM projects ORDER BY created_at DESC", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        projects.Add(new
        {
            id             = reader.GetGuid(0),
            name           = reader.GetString(1),
            client         = reader.IsDBNull(2)  ? null : reader.GetString(2),
            serviceType    = reader.IsDBNull(3)  ? null : reader.GetString(3),
            status         = reader.IsDBNull(4)  ? null : reader.GetString(4),
            startDate      = reader.IsDBNull(5)  ? null : reader.GetDateTime(5).ToString("yyyy-MM-dd"),
            createdAt      = reader.GetDateTime(6),
            projectCode    = reader.IsDBNull(7)  ? null : reader.GetString(7),
            whatsapp       = reader.IsDBNull(8)  ? null : reader.GetString(8),
            endDate        = reader.IsDBNull(9)  ? null : reader.GetDateTime(9).ToString("yyyy-MM-dd"),
            progress       = reader.IsDBNull(10) ? 0    : reader.GetInt32(10),
            assignedTo     = reader.IsDBNull(11) ? null : reader.GetGuid(11).ToString(),
            location       = reader.IsDBNull(12) ? null : reader.GetString(12),
            latitude       = reader.IsDBNull(13) ? (decimal?)null : reader.GetDecimal(13),
            longitude      = reader.IsDBNull(14) ? (decimal?)null : reader.GetDecimal(14),
            clientDocType   = reader.IsDBNull(15) ? null : reader.GetString(15),
            clientDocNumber = reader.IsDBNull(16) ? null : reader.GetString(16)
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
        @"INSERT INTO projects (name, client, service_type, status, start_date, end_date, progress, project_code, assigned_to, location, latitude, longitude, client_doc_type, client_doc_number)
          VALUES (@name, @client, @serviceType, @status, @startDate, @endDate, @progress,
                  'DIN-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6)), @assignedTo, @location, @latitude, @longitude, @clientDocType, @clientDocNumber)
          RETURNING id, project_code", conn);
    cmd.Parameters.AddWithValue("name",        req.Name);
    cmd.Parameters.AddWithValue("client",      req.Client      ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("serviceType", req.ServiceType ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("status",      req.Status      ?? "activo");
    cmd.Parameters.AddWithValue("startDate",   req.StartDate.HasValue ? req.StartDate.Value : DBNull.Value);
    cmd.Parameters.AddWithValue("endDate",     req.EndDate.HasValue   ? req.EndDate.Value   : DBNull.Value);
    cmd.Parameters.AddWithValue("progress",    req.Progress ?? 0);
    cmd.Parameters.AddWithValue("assignedTo",  req.AssignedTo != null ? Guid.Parse(req.AssignedTo) : DBNull.Value);
    cmd.Parameters.AddWithValue("location",  req.Location  ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("latitude",  req.Latitude.HasValue  ? req.Latitude.Value  : DBNull.Value);
    cmd.Parameters.AddWithValue("longitude", req.Longitude.HasValue ? req.Longitude.Value : DBNull.Value);
    cmd.Parameters.AddWithValue("clientDocType",   req.ClientDocType   ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("clientDocNumber", req.ClientDocNumber ?? (object)DBNull.Value);
    await using var reader = await cmd.ExecuteReaderAsync();
    if (await reader.ReadAsync())
        return Results.Ok(new { id = reader.GetGuid(0), projectCode = reader.GetString(1) });
    return Results.Ok(new { });
});

// PUT editar proyecto
app.MapPut("/api/projects/{id}", async (string id, ProjectRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        @"UPDATE projects SET
            name=@name, client=@client, service_type=@serviceType,
            status=@status, start_date=@startDate, end_date=@endDate,
            progress=@progress, assigned_to=@assignedTo,
            location=@location, latitude=@latitude, longitude=@longitude,
            client_doc_type=@clientDocType, client_doc_number=@clientDocNumber
          WHERE id=@id", conn);
    cmd.Parameters.AddWithValue("id",          Guid.Parse(id));
    cmd.Parameters.AddWithValue("name",        req.Name);
    cmd.Parameters.AddWithValue("client",      req.Client      ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("serviceType", req.ServiceType ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("status",      req.Status      ?? "activo");
    cmd.Parameters.AddWithValue("startDate",   req.StartDate.HasValue ? req.StartDate.Value : DBNull.Value);
    cmd.Parameters.AddWithValue("endDate",     req.EndDate.HasValue   ? req.EndDate.Value   : DBNull.Value);
    cmd.Parameters.AddWithValue("progress",    req.Progress ?? 0);
    cmd.Parameters.AddWithValue("assignedTo",  req.AssignedTo != null ? Guid.Parse(req.AssignedTo) : DBNull.Value);
    cmd.Parameters.AddWithValue("location",  req.Location  ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("latitude",  req.Latitude.HasValue  ? req.Latitude.Value  : DBNull.Value);
    cmd.Parameters.AddWithValue("longitude", req.Longitude.HasValue ? req.Longitude.Value : DBNull.Value);
    cmd.Parameters.AddWithValue("clientDocType",   req.ClientDocType   ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("clientDocNumber", req.ClientDocNumber ?? (object)DBNull.Value);
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});

// DELETE proyecto
app.MapDelete("/api/projects/{id}", async (string id) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand("DELETE FROM projects WHERE id=@id", conn);
    cmd.Parameters.AddWithValue("id", Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});

// ════════════════════════════════════════════════════════════
//  CONSULTA DNI / RUC (ApiPeru.dev) — autocompletar datos del cliente
//  Token en Render: variable de entorno ApiPeru__Token (o ApiPeru:Token en appsettings.json)
// ════════════════════════════════════════════════════════════
app.MapGet("/api/lookup/dni/{dni}", async (string dni) =>
{
    if (string.IsNullOrWhiteSpace(dni) || dni.Length != 8 || !dni.All(char.IsDigit))
        return Results.Ok(new { found = false, error = "El DNI debe tener 8 dígitos." });
    if (string.IsNullOrWhiteSpace(apiPeruToken))
        return Results.Ok(new { found = false, error = "El token de ApiPeru no está configurado en el servidor." });

    try
    {
        var httpReq = new HttpRequestMessage(HttpMethod.Get, $"https://apiperu.dev/api/dni/{dni}");
        httpReq.Headers.Add("Authorization", $"Bearer {apiPeruToken}");
        var resp = await httpApiPeru.SendAsync(httpReq);
        var json = await resp.Content.ReadFromJsonAsync<JsonElement>();

        if (!resp.IsSuccessStatusCode || !json.TryGetProperty("data", out var data))
            return Results.Ok(new { found = false, error = "No se encontró el DNI." });

        string? Get(string prop) => data.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

        var nombreCompleto = Get("nombre_completo");
        if (string.IsNullOrWhiteSpace(nombreCompleto))
        {
            var partes = new[] { Get("nombres"), Get("apellido_paterno"), Get("apellido_materno") }
                .Where(s => !string.IsNullOrWhiteSpace(s));
            nombreCompleto = string.Join(" ", partes);
        }

        if (string.IsNullOrWhiteSpace(nombreCompleto))
            return Results.Ok(new { found = false, error = "No se encontró el DNI." });

        return Results.Ok(new { found = true, name = nombreCompleto.Trim() });
    }
    catch
    {
        return Results.Ok(new { found = false, error = "No se pudo consultar el DNI en este momento." });
    }
});

app.MapGet("/api/lookup/ruc/{ruc}", async (string ruc) =>
{
    if (string.IsNullOrWhiteSpace(ruc) || ruc.Length != 11 || !ruc.All(char.IsDigit))
        return Results.Ok(new { found = false, error = "El RUC debe tener 11 dígitos." });
    if (string.IsNullOrWhiteSpace(apiPeruToken))
        return Results.Ok(new { found = false, error = "El token de ApiPeru no está configurado en el servidor." });

    try
    {
        var httpReq = new HttpRequestMessage(HttpMethod.Get, $"https://apiperu.dev/api/ruc/{ruc}");
        httpReq.Headers.Add("Authorization", $"Bearer {apiPeruToken}");
        var resp = await httpApiPeru.SendAsync(httpReq);
        var json = await resp.Content.ReadFromJsonAsync<JsonElement>();

        if (!resp.IsSuccessStatusCode || !json.TryGetProperty("data", out var data))
            return Results.Ok(new { found = false, error = "No se encontró el RUC." });

        string? Get(string prop) => data.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

        var razonSocial = Get("nombre_o_razon_social") ?? Get("razon_social") ?? Get("nombre");
        var direccion   = Get("direccion_completa") ?? Get("direccion");

        if (string.IsNullOrWhiteSpace(razonSocial))
            return Results.Ok(new { found = false, error = "No se encontró el RUC." });

        return Results.Ok(new { found = true, name = razonSocial.Trim(), address = direccion });
    }
    catch
    {
        return Results.Ok(new { found = false, error = "No se pudo consultar el RUC en este momento." });
    }
});

// POST login
app.MapPost("/api/auth/login", async (LoginRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, name, email, role FROM users WHERE email = @email AND password = @password", conn);
    cmd.Parameters.AddWithValue("email",    req.Email);
    cmd.Parameters.AddWithValue("password", req.Password);
    await using var reader = await cmd.ExecuteReaderAsync();
    if (await reader.ReadAsync())
    {
        var id    = reader.GetGuid(0).ToString();
        var name  = reader.GetString(1);
        var email = reader.GetString(2);
        var role  = reader.GetString(3);
        var token = GenerarToken(id, name, email, role);
        return Results.Ok(new { id, name, email, role, token });
    }
    return Results.Unauthorized();
});

// POST verificar token
app.MapPost("/api/auth/verify", (TokenRequest req) =>
{
    try
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var handler = new JwtSecurityTokenHandler();
        handler.ValidateToken(req.Token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = key,
            ValidateIssuer           = true,
            ValidIssuer              = "DinamikPlatform",
            ValidateAudience         = true,
            ValidAudience            = "DinamikFrontend",
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero
        }, out _);
        return Results.Ok(new { valid = true });
    }
    catch { return Results.Ok(new { valid = false }); }
});

// GET todos los usuarios
app.MapGet("/api/users", async () =>
{
    var users = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
        users.Add(new {
            id        = reader.GetGuid(0),
            name      = reader.GetString(1),
            email     = reader.GetString(2),
            role      = reader.GetString(3),
            createdAt = reader.GetDateTime(4)
        });
    return Results.Ok(users);
});

// POST crear usuario
app.MapPost("/api/users", async (UserRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var checkCmd = new NpgsqlCommand(
        "SELECT COUNT(*) FROM users WHERE email = @email", conn);
    checkCmd.Parameters.AddWithValue("email", req.Email);
    var count = (long)(await checkCmd.ExecuteScalarAsync())!;
    if (count > 0)
        return Results.BadRequest(new { error = "El email ya está registrado." });
    await using var cmd = new NpgsqlCommand(
        "INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role) RETURNING id", conn);
    cmd.Parameters.AddWithValue("name",     req.Name);
    cmd.Parameters.AddWithValue("email",    req.Email);
    cmd.Parameters.AddWithValue("password", req.Password);
    cmd.Parameters.AddWithValue("role",     req.Role ?? "tecnico");
    var id = await cmd.ExecuteScalarAsync();
    return Results.Ok(new { id });
});

// PATCH cambiar rol
app.MapPatch("/api/users/{id}/role", async (string id, RoleRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "UPDATE users SET role = @role WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("role", req.Role);
    cmd.Parameters.AddWithValue("id",   Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});

// DELETE usuario
app.MapDelete("/api/users/{id}", async (string id) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        "DELETE FROM users WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("id", Guid.Parse(id));
    await cmd.ExecuteNonQueryAsync();
    return Results.Ok(new { success = true });
});

// GET tareas por proyecto
app.MapGet("/api/tasks/{projectId}", async (string projectId) =>
{
    var tasks = new List<object>();
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        @"SELECT id, project_id, title, description, status, priority, assigned_to, due_date, created_at
          FROM tasks WHERE project_id = @projectId ORDER BY created_at DESC", conn);
    cmd.Parameters.AddWithValue("projectId", Guid.Parse(projectId));
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
        tasks.Add(new {
            id          = reader.GetGuid(0),
            projectId   = reader.GetGuid(1),
            title       = reader.GetString(2),
            description = reader.IsDBNull(3) ? null : reader.GetString(3),
            status      = reader.IsDBNull(4) ? null : reader.GetString(4),
            priority    = reader.IsDBNull(5) ? null : reader.GetString(5),
            assignedTo  = reader.IsDBNull(6) ? null : reader.GetString(6),
            dueDate     = reader.IsDBNull(7) ? null : reader.GetDateTime(7).ToString("yyyy-MM-dd"),
            createdAt   = reader.GetDateTime(8)
        });
    return Results.Ok(tasks);
});

// POST crear tarea
app.MapPost("/api/tasks", async (TaskRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        @"INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date)
          VALUES (@projectId, @title, @description, @status, @priority, @assignedTo, @dueDate)
          RETURNING id", conn);
    cmd.Parameters.AddWithValue("projectId",   Guid.Parse(req.ProjectId));
    cmd.Parameters.AddWithValue("title",       req.Title);
    cmd.Parameters.AddWithValue("description", req.Description ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("status",      req.Status      ?? "pendiente");
    cmd.Parameters.AddWithValue("priority",    req.Priority    ?? "media");
    cmd.Parameters.AddWithValue("assignedTo",  req.AssignedTo  ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("dueDate",     req.DueDate.HasValue ? req.DueDate.Value : DBNull.Value);
    var id = await cmd.ExecuteScalarAsync();

    // Recalcular progreso del proyecto (una tarea nueva baja el % si no está completada)
    await RecalcularProgreso(conn, Guid.Parse(req.ProjectId));

    return Results.Ok(new { id });
});

// PATCH actualizar estado de tarea + recalcular progreso del proyecto
app.MapPatch("/api/tasks/{id}/status", async (string id, TaskStatusRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();

    // 1. Actualizar estado de la tarea (y obtener a qué proyecto pertenece)
    await using var cmdTask = new NpgsqlCommand(
        "UPDATE tasks SET status = @status WHERE id = @id RETURNING project_id", conn);
    cmdTask.Parameters.AddWithValue("status", req.Status);
    cmdTask.Parameters.AddWithValue("id",     Guid.Parse(id));
    var projectId = (Guid)(await cmdTask.ExecuteScalarAsync())!;

    // 2. Recalcular progreso y sincronizar estado del proyecto
    await RecalcularProgreso(conn, projectId);

    return Results.Ok(new { success = true });
});

// PUT editar tarea
app.MapPut("/api/tasks/{id}", async (string id, TaskRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(
        @"UPDATE tasks SET title=@title, description=@description, status=@status,
            priority=@priority, assigned_to=@assignedTo, due_date=@dueDate
          WHERE id=@id", conn);
    cmd.Parameters.AddWithValue("id",          Guid.Parse(id));
    cmd.Parameters.AddWithValue("title",       req.Title);
    cmd.Parameters.AddWithValue("description", req.Description ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("status",      req.Status      ?? "pendiente");
    cmd.Parameters.AddWithValue("priority",    req.Priority    ?? "media");
    cmd.Parameters.AddWithValue("assignedTo",  req.AssignedTo  ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("dueDate",     req.DueDate.HasValue ? req.DueDate.Value : DBNull.Value);
    await cmd.ExecuteNonQueryAsync();

    // Recalcular progreso del proyecto (función reutilizable)
    await RecalcularProgreso(conn, Guid.Parse(req.ProjectId));

    return Results.Ok(new { success = true });
});

// DELETE tarea + recalcular progreso del proyecto
app.MapDelete("/api/tasks/{id}", async (string id) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();

    // Borrar la tarea y recuperar a qué proyecto pertenecía
    await using var cmd = new NpgsqlCommand(
        "DELETE FROM tasks WHERE id = @id RETURNING project_id", conn);
    cmd.Parameters.AddWithValue("id", Guid.Parse(id));
    var result = await cmd.ExecuteScalarAsync();

    // Si se borró algo, recalcular el progreso del proyecto
    if (result is Guid projectId)
        await RecalcularProgreso(conn, projectId);

    return Results.Ok(new { success = true });
});

// ════════════════════════════════════════════════════════════
//  ASISTENTE IA (Groq / Llama 3.3) — la API key queda en el SERVIDOR
// ════════════════════════════════════════════════════════════
var httpGroq = new HttpClient();
string groqKey = builder.Configuration["Groq:ApiKey"] ?? "";

// Construye el contexto de la empresa leyendo la base de datos
async Task<string> ConstruirContexto(string cs)
{
    var sb = new StringBuilder();
    await using var conn = new NpgsqlConnection(cs);
    await conn.OpenAsync();

    // Proyectos
    var lineasProy = new List<string>();
    await using (var cmd = new NpgsqlCommand(
        @"SELECT name, project_code, client, service_type, status, end_date, progress
          FROM projects ORDER BY created_at DESC", conn))
    await using (var r = await cmd.ExecuteReaderAsync())
    {
        while (await r.ReadAsync())
        {
            var name   = r.GetString(0);
            var code   = r.IsDBNull(1) ? "" : r.GetString(1);
            var client = r.IsDBNull(2) ? "N/A" : r.GetString(2);
            var serv   = r.IsDBNull(3) ? "N/A" : r.GetString(3);
            var status = r.IsDBNull(4) ? "N/A" : r.GetString(4);
            var fin    = r.IsDBNull(5) ? "N/A" : r.GetDateTime(5).ToString("yyyy-MM-dd");
            var prog   = r.IsDBNull(6) ? 0 : r.GetInt32(6);
            lineasProy.Add($"- {name} ({code}) | Cliente: {client} | Servicio: {serv} | Estado: {status} | Fin: {fin} | Progreso: {prog}%");
        }
    }
    sb.AppendLine($"PROYECTOS ({lineasProy.Count} total):");
    sb.AppendLine(string.Join("\n", lineasProy));
    sb.AppendLine();

    // Tareas (conteo por estado)
    int pend = 0, enProc = 0, comp = 0; long totalT = 0;
    await using (var cmd = new NpgsqlCommand("SELECT status, COUNT(*) FROM tasks GROUP BY status", conn))
    await using (var r = await cmd.ExecuteReaderAsync())
    {
        while (await r.ReadAsync())
        {
            var st = r.IsDBNull(0) ? "" : r.GetString(0);
            var c  = r.GetInt64(1);
            totalT += c;
            if (st == "pendiente")  pend   = (int)c;
            else if (st == "en_proceso") enProc = (int)c;
            else if (st == "completado") comp = (int)c;
        }
    }
    sb.AppendLine($"TAREAS ({totalT} total): Pendientes {pend}, En proceso {enProc}, Completadas {comp}");
    sb.AppendLine();

    // Usuarios
    var lineasUsr = new List<string>();
    await using (var cmd = new NpgsqlCommand("SELECT name, role FROM users ORDER BY created_at DESC", conn))
    await using (var r = await cmd.ExecuteReaderAsync())
    {
        while (await r.ReadAsync())
            lineasUsr.Add($"- {r.GetString(0)} ({r.GetString(1)})");
    }
    sb.AppendLine($"USUARIOS ({lineasUsr.Count} total):");
    sb.AppendLine(string.Join("\n", lineasUsr));
    sb.AppendLine();

    // Documentos (conteo por tipo) — misma base de datos
    var lineasDoc = new List<string>(); long totalD = 0;
    await using (var cmd = new NpgsqlCommand("SELECT type, COUNT(*) FROM documents GROUP BY type", conn))
    await using (var r = await cmd.ExecuteReaderAsync())
    {
        while (await r.ReadAsync())
        {
            var t = r.IsDBNull(0) ? "otro" : r.GetString(0);
            var c = r.GetInt64(1);
            totalD += c;
            lineasDoc.Add($"{t}: {c}");
        }
    }
    sb.AppendLine($"DOCUMENTOS ({totalD} total): {string.Join(", ", lineasDoc)}");

    return sb.ToString();
}

// Contexto de UN solo proyecto (para el cliente identificado por su código)
async Task<string> ConstruirContextoCliente(string cs, string code)
{
    var sb = new StringBuilder();
    await using var conn = new NpgsqlConnection(cs);
    await conn.OpenAsync();

    Guid? projId = null;
    await using (var cmd = new NpgsqlCommand(
        @"SELECT id, name, project_code, client, service_type, status, start_date, end_date, progress
          FROM projects WHERE UPPER(project_code) = UPPER(@code) LIMIT 1", conn))
    {
        cmd.Parameters.AddWithValue("code", code);
        await using var r = await cmd.ExecuteReaderAsync();
        if (await r.ReadAsync())
        {
            projId      = r.GetGuid(0);
            var name    = r.GetString(1);
            var pcode   = r.IsDBNull(2) ? "" : r.GetString(2);
            var client  = r.IsDBNull(3) ? "N/A" : r.GetString(3);
            var serv    = r.IsDBNull(4) ? "N/A" : r.GetString(4);
            var status  = r.IsDBNull(5) ? "N/A" : r.GetString(5);
            var inicio  = r.IsDBNull(6) ? "N/A" : r.GetDateTime(6).ToString("yyyy-MM-dd");
            var fin     = r.IsDBNull(7) ? "N/A" : r.GetDateTime(7).ToString("yyyy-MM-dd");
            var prog    = r.IsDBNull(8) ? 0 : r.GetInt32(8);
            sb.AppendLine("PROYECTO DEL CLIENTE:");
            sb.AppendLine($"- Nombre: {name} ({pcode})");
            sb.AppendLine($"- Cliente: {client}");
            sb.AppendLine($"- Servicio: {serv}");
            sb.AppendLine($"- Estado: {status}");
            sb.AppendLine($"- Progreso: {prog}%");
            sb.AppendLine($"- Inicio: {inicio} · Fin estimado: {fin}");
        }
    }

    if (projId == null)
        return "(No se encontró el proyecto del cliente.)";

    // Tareas de ese proyecto
    var tareas = new List<string>();
    await using (var cmd = new NpgsqlCommand(
        "SELECT title, status, due_date FROM tasks WHERE project_id = @id ORDER BY created_at", conn))
    {
        cmd.Parameters.AddWithValue("id", projId.Value);
        await using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            var titulo = r.GetString(0);
            var st     = r.IsDBNull(1) ? "" : r.GetString(1);
            var vence  = r.IsDBNull(2) ? "" : $" (vence {r.GetDateTime(2):yyyy-MM-dd})";
            tareas.Add($"- [{st}] {titulo}{vence}");
        }
    }
    sb.AppendLine();
    sb.AppendLine($"TAREAS DEL PROYECTO ({tareas.Count}):");
    sb.AppendLine(tareas.Count > 0 ? string.Join("\n", tareas) : "- (sin tareas registradas)");

    // Entregables visibles de ese proyecto
    var entregables = new List<string>();
    await using (var cmd = new NpgsqlCommand(
        "SELECT name, type FROM documents WHERE project_id = @id AND enabled = TRUE ORDER BY uploaded_at DESC", conn))
    {
        cmd.Parameters.AddWithValue("id", projId.Value);
        await using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            var nombre = r.GetString(0);
            var tipo   = r.IsDBNull(1) ? "otro" : r.GetString(1);
            entregables.Add($"- {tipo}: {nombre}");
        }
    }
    sb.AppendLine();
    sb.AppendLine($"ENTREGABLES DISPONIBLES ({entregables.Count}):");
    sb.AppendLine(entregables.Count > 0 ? string.Join("\n", entregables) : "- (sin entregables disponibles)");

    return sb.ToString();
}

app.MapPost("/api/chat", async (ChatRequest req) =>
{
    if (string.IsNullOrWhiteSpace(groqKey))
        return Results.Ok(new { reply = "⚠️ El servidor no tiene configurada la API key de Groq (revisa appsettings.json)." });

    // 1) Cliente identificado por su código -> contexto SOLO de su proyecto
    // 2) Panel interno (admin) -> contexto de toda la empresa
    // 3) Resto -> respuesta general
    string contexto;
    if (!string.IsNullOrWhiteSpace(req.ProjectCode))
        contexto = await ConstruirContextoCliente(connStr, req.ProjectCode);
    else if (req.WithContext)
        contexto = await ConstruirContexto(connStr);
    else
        contexto = "(Responde de forma general sobre DINAMIK: servicios, contacto, etc.)";

    var systemPrompt = $@"Eres DINA, la asistente virtual inteligente de DINAMIK DK GROUP SAC, empresa peruana de Arquitectura, Ingeniería & Construcción en Jesús María, Lima.
Personalidad: amigable, profesional, español peruano natural, emojis con moderación.

DATOS ACTUALES:
{contexto}

REGLAS:
- Responde siempre en español, de forma clara y concisa (máximo 4 líneas).
- Usa los datos de arriba para responder sobre proyectos, tareas, documentos y usuarios.
- Nunca inventes datos que no estén en el contexto.
- Si no tienes información suficiente, sugiere contactar por WhatsApp al +51 962 744 341.
- Para preguntas técnicas de ingeniería, sé precisa y profesional.
- FECHA HOY: {DateTime.Now:dd 'de' MMMM 'de' yyyy}";

    var mensajes = new List<object> { new { role = "system", content = systemPrompt } };
    foreach (var m in req.Messages)
        mensajes.Add(new { role = m.Role, content = m.Content });

    var payload = new
    {
        model = "llama-3.3-70b-versatile",
        max_tokens = 600,
        temperature = 0.75,
        messages = mensajes
    };

    try
    {
        var httpReq = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        httpReq.Headers.Add("Authorization", $"Bearer {groqKey}");
        httpReq.Content = JsonContent.Create(payload);

        var resp = await httpGroq.SendAsync(httpReq);
        if (!resp.IsSuccessStatusCode)
            return Results.Ok(new { reply = "❌ La IA no respondió correctamente. Revisa la API key o tu cuota de Groq." });

        var json  = await resp.Content.ReadFromJsonAsync<JsonElement>();
        var reply = json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        return Results.Ok(new { reply });
    }
    catch
    {
        return Results.Ok(new { reply = "❌ No pude conectarme con la IA. Intenta de nuevo en un momento." });
    }
});

app.Run();

record ProjectRequest(string Name, string? Client, string? ServiceType, string? Status, DateOnly? StartDate, DateOnly? EndDate, int? Progress, string? AssignedTo, string? Location, decimal? Latitude, decimal? Longitude, string? ClientDocType, string? ClientDocNumber);
record LoginRequest(string Email, string Password);
record TokenRequest(string Token);
record UserRequest(string Name, string Email, string Password, string? Role);
record RoleRequest(string Role);
record TaskRequest(string ProjectId, string Title, string? Description, string? Status, string? Priority, string? AssignedTo, DateOnly? DueDate);
record TaskStatusRequest(string Status);

record ChatRequest(List<ChatMessage> Messages, bool WithContext, string? ProjectCode);
record ChatMessage(string Role, string Content);