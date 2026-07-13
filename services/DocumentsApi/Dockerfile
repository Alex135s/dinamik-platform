# ── Etapa 1: compilar la aplicación ──
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia el archivo de proyecto y restaura las dependencias (NuGet)
COPY DocumentsApi.csproj ./
RUN dotnet restore DocumentsApi.csproj

# Copia el resto del código y publica en modo Release
COPY . ./
RUN dotnet publish DocumentsApi.csproj -c Release -o /app/publish

# ── Etapa 2: imagen final (solo lo necesario para ejecutar) ──
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render asigna el puerto por la variable PORT (ya lo lee Program.cs)
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000

ENTRYPOINT ["dotnet", "DocumentsApi.dll"]
