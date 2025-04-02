using ManufacturingAPI.Models;
using ManufacturingAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ManufacturingAPI.Controllers
{
    [Route("api/comments")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;

        public CommentsController()
        {
            _commentService = new CommentService();
        }

        [HttpGet]
        public IActionResult GetComments()
        {
            return Ok(_commentService.GetComments());
        }

        [HttpGet("{id}")]
        public IActionResult GetComment(int id)
        {
            var comment = _commentService.GetCommentById(id);
            if (comment == null)
                return NotFound(new { message = "Comment not found" });

            return Ok(comment);
        }

        [HttpPost]
        public IActionResult AddComment([FromBody] string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return BadRequest(new { message = "Comment cannot be empty" });

            _commentService.AddComment(text);
            return Ok(new { message = "Comment added successfully!" });
        }
    }
}
