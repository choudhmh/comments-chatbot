using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;  // Add this namespace for OpenApi

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();  // Register controllers

// Register OpenAPI/Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Manufacturing API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();  // Enable Swagger middleware
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Manufacturing API v1"));
}

app.UseHttpsRedirection();

// Register controllers (this enables routing for your CommentsController)
app.MapControllers();

app.Run();
