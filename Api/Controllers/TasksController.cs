using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly IMongoDatabase _database;

        public TasksController(IMongoDatabase database)
        {
            _database = database;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetAll()
        {
            var collection = _database.GetCollection<ToDoTask>(nameof(ToDoTask));
        
            var results = await collection.Find(_ => true).ToListAsync();
            
            return Ok(results);
        }
        
        [HttpPost("")]
        public async Task<IActionResult> PostItem([FromBody] List<ToDoTask> request, CancellationToken cancellationToken)
        {
            var collection = _database.GetCollection<ToDoTask>(nameof(ToDoTask));

            InsertManyOptions options = new()
            {
                IsOrdered = false
            };

            try
            {
                var existingRecords = collection.Find(f => true).ToList(cancellationToken);
                var deletedRecords = existingRecords
                    .Where(e => !request.Select(r => r.Id).Contains(e.Id))
                    .Select(e => e.Id)
                    .ToList();
                await collection.DeleteManyAsync(f => deletedRecords.Contains(f.Id), cancellationToken);
                
                await collection.InsertManyAsync(request, options, cancellationToken);
                
            }

            catch (MongoBulkWriteException e)
            {
                if (IsNonDuplicateKeyError(e))
                    throw new InvalidOperationException("An error occurred while inserting the items", e);
            }

            return Ok();
    }

    private static bool IsNonDuplicateKeyError(MongoBulkWriteException e)
    {
        return e.WriteErrors.Any(error => error.Category != ServerErrorCategory.DuplicateKey);
    }

}
}

public class ToDoTask
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public ushort? Quadrant { get; init; }
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }

    public IEnumerable<string> Tags { get; set; } = [];
}