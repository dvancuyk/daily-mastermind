using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly IMongoDatabase _database;

        public TasksController(IMongoDatabase database)
        {
            _database = database;
        }

        [HttpPost("")]
        public async Task<IActionResult> PostItem([FromBody] ToDoTask request)
        {
            var collection = _database.GetCollection<ToDoTask>(nameof(ToDoTask));

            await collection.InsertOneAsync(request);
            return Ok();
        }
    }
}

public class ToDoTask
{
    public Guid Id { get; init; }
    public string Name { get; init; }
    public string Quadrant { get; init; } = "unassigned";
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }
}