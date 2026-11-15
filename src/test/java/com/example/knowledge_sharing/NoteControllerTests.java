package com.example.knowledge_sharing;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NoteControllerTests {
    @Test
    void rejectsInvalidNotesBeforeAccessingDatabase() {
        JdbcClient jdbc = mock(JdbcClient.class);
        NoteController controller = new NoteController(jdbc);
        NoteController.NewNote[] invalid = {
                null, new NoteController.NewNote(null, "body"),
                new NoteController.NewNote("title", null),
                new NoteController.NewNote(" \t", "body"),
                new NoteController.NewNote("title", "\n"),
                new NoteController.NewNote("x".repeat(201), "body"),
                new NoteController.NewNote("title", "x".repeat(10001))
        };
        for (var note : invalid) {
            var error = assertThrows(ResponseStatusException.class, () -> controller.save(note));
            assertEquals(400, error.getStatusCode().value());
        }
        verifyNoInteractions(jdbc);
    }

    @Test
    void savesTrimmedValuesAndReturnsInsertedRow() {
        JdbcClient jdbc = mock(JdbcClient.class, RETURNS_DEEP_STUBS);
        NoteController controller = new NoteController(jdbc);
        var statement = jdbc.sql(anyString());
        var titled = statement.param("title", "Example");
        var populated = titled.param("content", "Body");
        var expected = new NoteController.Note(1L, "Example", "Body", null);
        when(populated.query(NoteController.Note.class).single()).thenReturn(expected);

        assertEquals(expected, controller.save(new NoteController.NewNote(" Example ", " Body ")));
    }
}
