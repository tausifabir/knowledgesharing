package com.example.knowledge_sharing;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PatternControllerTests {
    private final PatternController controller = new PatternController();
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();

    @Test
    void executesAllEightExamples() throws Exception {
        for (String pattern : new String[]{"singleton", "prototype", "simple-factory", "factory-method",
                "abstract-factory", "builder", "character-factory", "character-builder"}) {
            mvc.perform(post("/api/patterns/" + pattern).contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.explanation").isNotEmpty())
                    .andExpect(jsonPath("$.output").isMap());
        }
    }

    @Test
    void demonstratesSharedInstanceAndCopyReferences() throws Exception {
        mvc.perform(post("/api/patterns/singleton").contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"Shared\"}"))
                .andExpect(jsonPath("$.output['Same instance']").value(true))
                .andExpect(jsonPath("$.output['Alice reads']").value("Shared"))
                .andExpect(jsonPath("$.output['Bob reads']").value("Shared"));
        mvc.perform(post("/api/patterns/prototype").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(jsonPath("$.output.Template").value("Guest | Wedding at 6 PM. Dinner included."))
                .andExpect(jsonPath("$.output['Shallow copy']").value("Alice | Wedding at 6 PM. Dinner included."))
                .andExpect(jsonPath("$.output['Deep copy']").value("Bob | Wedding at 6 PM."))
                .andExpect(jsonPath("$.output['Shared shallow message']").value(true))
                .andExpect(jsonPath("$.output['Shared deep message']").value(false));
    }

    @Test
    void usesActualFactoriesAndBuilderSettings() {
        for (String type : new String[]{"wedding", "birthday"}) {
            String title = type.equals("wedding") ? "Wedding" : "Birthday";
            for (String pattern : new String[]{"simple-factory", "factory-method", "abstract-factory"}) {
                assertTrue(controller.run(pattern, Map.of("type", type)).output().values().toString().contains(title + " invitation"));
            }
            var result = controller.run("builder", Map.of("type", type, "recipient", "Bob", "venue", "Garden", "theme", "Blue", "dressCode", "Formal"));
            assertEquals(title + " invitation for Bob at Garden | Theme: Blue" + (type.equals("birthday") ? " | Dress Code: Formal" : ""), result.output().get("Message"));
        }
        Map<String, String> loadouts = Map.of("warrior", "Greatsword + Plate Armor + Berserk Slash",
                "mage", "Arcane Staff + Silk Robe + Fireball", "archer", "Longbow + Leather Armor + Eagle Eye");
        loadouts.forEach((type, expected) -> {
            assertEquals(expected, controller.run("character-factory", Map.of("type", type)).output().get("Loadout"));
            String built = controller.run("character-builder", Map.of("type", type, "weapon", "Custom", "level", 42)).output().get("Character").toString();
            assertTrue(built.contains("weapon=Custom"));
            assertTrue(built.contains("level=42"));
        });
    }

    @Test
    void rejectsInvalidRequests() throws Exception {
        for (String json : new String[]{"{\"recipient\":\" \"}", "{\"recipient\":null}", "{\"recipient\":7}",
                "{\"type\":\"unknown\"}", "{\"venue\":\"" + "x".repeat(501) + "\"}"}) {
            mvc.perform(post("/api/patterns/builder").contentType(MediaType.APPLICATION_JSON).content(json))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").isNotEmpty());
        }
        for (String level : new String[]{"0", "101", "1.5", "null", "\"10\"", "true"}) {
            mvc.perform(post("/api/patterns/character-builder").contentType(MediaType.APPLICATION_JSON).content("{\"level\":" + level + "}"))
                    .andExpect(status().isBadRequest());
        }
        for (String json : new String[]{"null", "[]", "broken"}) {
            mvc.perform(post("/api/patterns/singleton").contentType(MediaType.APPLICATION_JSON).content(json))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/patterns/missing").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/patterns/singleton").contentType(MediaType.TEXT_PLAIN).content("{}"))
                .andExpect(status().isUnsupportedMediaType());
    }
}
