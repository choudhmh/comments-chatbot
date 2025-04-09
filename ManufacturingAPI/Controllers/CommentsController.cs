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
        return Ok(comments);
    }

    [HttpPost]
    public IActionResult AddComment([FromBody] string comment)
    {
        comments.Add(comment);
        
        // Generate a simple response based on the comment
        string botResponse = GenerateResponse(comment);
        
        return Ok(new { userMessage = comment, botMessage = botResponse });
    }

    private string GenerateResponse(string comment)
    {
        if (comment.ToLower().Contains("overheating"))
        {
            return "Please check the cooling system and reduce machine load.";
        }
        else if (comment.ToLower().Contains("defective"))
        {
            return "Check the quality control logs for the defective batch.";
        }
        else if (comment.ToLower().Contains("maintenance"))
        {
            return "Routine maintenance is crucial for efficiency. Keep it up!";
        }
        return "Hello, Thank you for your input! Let me know if I can be of  assistance.";
    }
}
