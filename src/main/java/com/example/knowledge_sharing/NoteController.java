package com.example.knowledge_sharing;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final JdbcClient jdbc;

    public NoteController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record Note(Long id, String title, String content, OffsetDateTime createdAt) {}
    public record NewNote(String title, String content) {}

    // ponytail: latest 100 notes only; add cursor pagination when older notes need browsing.
    @GetMapping
    public List<Note> list() {
        return jdbc.sql("SELECT id, title, content, created_at FROM sharing_notes ORDER BY id DESC LIMIT 100")
                .query(Note.class).list();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Note save(@RequestBody NewNote input) {
        if (input == null || input.title() == null || input.content() == null
                || input.title().isBlank() || input.title().length() > 200
                || input.content().isBlank() || input.content().length() > 10000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Title must contain 1–200 characters; content must contain 1–10000 characters.");
        }
        return jdbc.sql("""
                INSERT INTO sharing_notes (title, content) VALUES (:title, :content)
                RETURNING id, title, content, created_at
                """)
                .param("title", input.title().strip())
                .param("content", input.content().strip())
                .query(Note.class).single();
    }

    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Map<String, String> databaseUnavailable(DataAccessException exception) {
        return Map.of("message", "Database operation failed. Check saved notes before retrying.");
    }
}
