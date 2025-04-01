using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

[Route("api/[controller]")]
[ApiController]
public class CommentsController : ControllerBase
{
    private static readonly List<string> comments = new()
    {
        "Machine stopped due to overheating.",
        "Defective part found in production line.",
        "Routine maintenance completed successfully."
    };

    [HttpGet]
    public IActionResult GetComments()
    {
        return Ok(comments);  // Returns the list of comments
    }

    [HttpPost]
    public IActionResult AddComment([FromBody] string comment)
    {
        comments.Add(comment);  // Adds a new comment to the list
        return Ok(new { message = "Comment added successfully!" });
    }
}
