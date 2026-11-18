package com.example.knowledge_sharing;

import com.example.knowledge_sharing.builder.BirthdayBuilderInvitation;
import com.example.knowledge_sharing.builder.WeddingBuilderInvitation;
import com.example.knowledge_sharing.exercise.builder.ArcherBuilder;
import com.example.knowledge_sharing.exercise.builder.MageBuilder;
import com.example.knowledge_sharing.exercise.builder.WarriorBuilder;
import com.example.knowledge_sharing.exercise.factory.ArcherCreator;
import com.example.knowledge_sharing.exercise.factory.MageCreator;
import com.example.knowledge_sharing.exercise.factory.WarriorCreator;
import com.example.knowledge_sharing.exercise.factory.base.CharacterCreator;
import com.example.knowledge_sharing.factory.abstraction.*;
import com.example.knowledge_sharing.factory.method.*;
import com.example.knowledge_sharing.factory.simple.InvitationFactory;
import com.example.knowledge_sharing.prototype.InvitationCard;
import com.example.knowledge_sharing.singleton.Whiteboard;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patterns")
public class PatternController {
    public record Result(String explanation, Map<String, Object> output) {}

    @PostMapping(value = "/{pattern}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Result run(@PathVariable("pattern") String pattern, @RequestBody Map<String, Object> input) {
        return switch (pattern) {
            case "singleton" -> {
                String message = text(input, "message", "Hello from Alice");
                Whiteboard alice = Whiteboard.getInstance();
                Whiteboard bob = Whiteboard.getInstance();
                // ponytail: process-wide teaching state; isolate state before accepting private user content.
                synchronized (alice) {
                    alice.write(message);
                    yield result("Alice and Bob reference the same Whiteboard. A write through Alice is visible through Bob.",
                            "Alice reads", alice.read(), "Bob reads", bob.read(), "Same instance", alice == bob);
                }
            }
            case "prototype" -> {
                InvitationCard template = new InvitationCard("Guest", new StringBuilder(text(input, "message", "Wedding at 6 PM.")));
                InvitationCard shallow = template.shallowCopy();
                InvitationCard deep = template.deepCopy();
                shallow.setGuestName("Alice");
                deep.setGuestName("Bob");
                shallow.getMessage().append(text(input, "addition", " Dinner included."));
                yield result("The shallow copy shares the mutable message; the deep copy has an independent message.",
                        "Template", template.getGuestName() + " | " + template.getMessage(),
                        "Shallow copy", shallow.getGuestName() + " | " + shallow.getMessage(),
                        "Deep copy", deep.getGuestName() + " | " + deep.getMessage(),
                        "Shared shallow message", template.getMessage() == shallow.getMessage(),
                        "Shared deep message", template.getMessage() == deep.getMessage());
            }
            case "simple-factory", "factory-method", "abstract-factory", "builder" -> invitation(pattern, input);
            case "character-factory", "character-builder" -> character(pattern, input);
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown pattern.");
        };
    }

    private Result invitation(String pattern, Map<String, Object> input) {
        String type = pattern.equals("builder")
                ? choice(input, "wedding", "wedding", "birthday")
                : choice(input, "wedding", "wedding", "birthday", "visiting", "membership", "gift", "playing");
        boolean wedding = type.equals("wedding");
        return switch (pattern) {
            case "simple-factory" -> {
                var product = InvitationFactory.create(type);
                yield result("A type string selects a concrete invitation inside InvitationFactory.create().",
                        "Product", product.getClass().getSimpleName(), "Message", product.message());
            }
            case "factory-method" -> {
                InvitationEvent.InvitingEvent event = switch (type) {
                    case "birthday" -> new BirthdayEvent();
                    case "visiting" -> new VisitingEvent();
                    case "membership" -> new MembershipEvent();
                    case "gift" -> new GiftEvent();
                    case "playing" -> new PlayingEvent();
                    default -> new WeddingEvent();
                };
                yield result("The event subclass overrides createInvitation(); inherited prepareInvitation() uses that product.",
                        "Creator", event.getClass().getSimpleName(), "Message", event.prepareInvitation());
            }
            case "abstract-factory" -> {
                EventFactory factory = switch (type) {
                    case "birthday" -> new BirthdayFactory();
                    case "visiting" -> new VisitingFactory();
                    case "membership" -> new MembershipFactory();
                    case "gift" -> new GiftFactory();
                    case "playing" -> new PlayingFactory();
                    default -> new WeddingFactory();
                };
                yield result("One factory creates a matching invitation and envelope family.",
                        "Factory", factory.getClass().getSimpleName(), "Invitation", factory.createInvitation().message(),
                        "Envelope", factory.createEnvelope().description(), "Matching set", EventFactory.prepareMatchingSet(factory));
            }
            default -> {
                String recipient = text(input, "recipient", "Alice");
                String venue = text(input, "venue", "Main Hall");
                String theme = text(input, "theme", "White");
                var product = wedding
                        ? new WeddingBuilderInvitation.Builder().recipient(recipient).venue(venue).theme(theme).build()
                        : new BirthdayBuilderInvitation.Builder().recipient(recipient).venue(venue).theme(theme)
                            .dressCode(text(input, "dressCode", "Casual")).build();
                yield result("Chain settings, then build one invitation. The birthday builder also accepts a dress code.",
                        "Product", product.getClass().getSimpleName(), "Message", product.message());
            }
        };
    }

    private Result character(String pattern, Map<String, Object> input) {
        String type = choice(input, "warrior", "warrior", "mage", "archer");
        if (pattern.equals("character-factory")) {
            CharacterCreator factory = switch (type) {
                case "mage" -> new MageCreator();
                case "archer" -> new ArcherCreator();
                default -> new WarriorCreator();
            };
            return result("The character factory creates a compatible weapon, armor, and special ability.",
                    "Factory", factory.getClass().getSimpleName(), "Loadout", factory.spawnCharacter());
        }
        String weapon = text(input, "weapon", "Greatsword");
        String armor = text(input, "armor", "Plate Armor");
        String ability = text(input, "specialAbility", "Berserk Slash");
        String combo = text(input, "comboSkills", "Shield Bash + Whirlwind");
        Object value = input.getOrDefault("level", 10);
        if (!(value instanceof Number number) || !Double.isFinite(number.doubleValue())
                || number.doubleValue() < 1 || number.doubleValue() > 100 || number.doubleValue() != number.intValue()) {
            throw new IllegalArgumentException("level must be an integer from 1 to 100.");
        }
        int level = ((Number) value).intValue();
        var product = switch (type) {
            case "mage" -> new MageBuilder().weapon(weapon).armor(armor).specialAbility(ability).level(level).comboSkills(combo).build();
            case "archer" -> new ArcherBuilder().weapon(weapon).armor(armor).specialAbility(ability).level(level).comboSkills(combo).build();
            default -> new WarriorBuilder().weapon(weapon).armor(armor).specialAbility(ability).level(level).comboSkills(combo).build();
        };
        return result("Customize one character step by step. In this exercise the builder class also acts as its product.",
                "Product", product.getClass().getSimpleName(), "Character", product.toString());
    }

    private static String text(Map<String, Object> input, String field, String fallback) {
        Object value = input.getOrDefault(field, fallback);
        if (!(value instanceof String text) || text.isBlank() || text.length() > 500) {
            throw new IllegalArgumentException(field + " must contain 1–500 nonblank characters.");
        }
        return text;
    }

    private static String choice(Map<String, Object> input, String fallback, String... allowed) {
        String type = text(input, "type", fallback);
        for (String option : allowed) if (option.equals(type)) return type;
        throw new IllegalArgumentException("type must be one of: " + String.join(", ", allowed));
    }

    private static Result result(String explanation, Object... pairs) {
        Map<String, Object> output = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) output.put((String) pairs[i], pairs[i + 1]);
        return new Result(explanation, output);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalidInput(IllegalArgumentException error) {
        return Map.of("message", error.getMessage());
    }
}
