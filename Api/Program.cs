using System.Text.Json.Nodes;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Load configuration settings
var mongoSettings = builder.Configuration.GetSection("Databases:Mongo");
var connectionString = mongoSettings["ConnectionString"];
var databaseName = mongoSettings["DatabaseName"];
BsonSerializer.RegisterSerializer(GuidSerializer.StandardInstance);

// Configure MongoDB
var mongoClient = new MongoClient(connectionString);
var database = mongoClient.GetDatabase(databaseName);

builder.Services.AddSingleton(database);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();