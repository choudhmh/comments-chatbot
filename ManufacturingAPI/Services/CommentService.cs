using ManufacturingAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace ManufacturingAPI.Services
{
    public class CommentService
    {
        private readonly List<Comment> _comments = new()
        {
            new Comment { Id = 1, Text = "Machine stopped due to overheating." },
            new Comment { Id = 2, Text = "Defective part found in production line." },
            new Comment { Id = 3, Text = "Routine maintenance completed successfully." }
        };

        public List<Comment> GetComments() => _comments;

        public Comment? GetCommentById(int id) => _comments.FirstOrDefault(c => c.Id == id);

        public void AddComment(string text)
        {
            var newComment = new Comment { Id = _comments.Count + 1, Text = text };
            _comments.Add(newComment);
        }
    }
}
