# Pattern playground

Start using `./gradlew bootRun`, then open `/` on the configured server port (currently `8090`). Root forwards to `/patterns.html`, the default dashboard. Existing notes page remains at `/index.html`.

- Eight examples execute existing Java pattern classes through `POST /api/patterns/{pattern}`.
- Java previews follow current event type, character class, and field values. Editing inputs clears previous output so it cannot be confused with a new run.
- **Factory vs Builder** sends the same input to `/api/patterns/simple-factory` and `/api/patterns/builder`. Factory reads only `type`; Builder applies recipient, venue, theme, and birthday dress code. Both results appear separately, only after both requests succeed.
- Comparison reuses existing endpoints. No extra controller, dependency, or database write.

## Visual walkthrough

All nine examples include **Watch the pattern**: labeled object boxes, plain-language captions, and matching highlighted Java lines. **Play / Pause**, **Next step**, and **Restart** control the walkthrough. Nothing auto-plays. Playback holds each step for 6.5 seconds. Changed card content crossfades over 1.2 seconds; inactive slots retain space, and hidden sizing snapshots reserve each slot's tallest content at the current width to prevent layout jumps. Code and relationship highlights transition gradually. Changing inputs resets the preview; hiding the page pauses playback. Reduced-motion preferences disable transitions.

Simple Factory uses five stable-position snapshots: request, branch selection, construction, return through `Invitation`, and reading the message. Internal construction/return snapshots share the `InvitationFactory.create()` caller-line highlight because they expand one method call, not additional executed caller lines. Code structure shows six concrete products, marking the selected branch and five alternatives. All three card factory patterns support wedding, birthday, visiting, membership, gift, and playing, creating `WeddingCard`, `BirthdayCard`, `VisitingCard`, `MembershipCard`, `GiftCard`, and `PlayingCard`. The shared `Invitation` interface lives in `common/invitation/Invitation.java` (`com.example.knowledge_sharing.common.invitation`), independent of creation patterns. Java callers must update imports from its former `factory.simple` package. Interface name, `message()` contract, `InvitationFactory`, creation method names, response fields, and message strings remain unchanged. Legacy WeddingInvitation/BirthdayInvitation classes remain available to existing callers. Factory Method uses six event subclasses; Abstract Factory uses six factories with matching envelopes. More choices—even 20—do not change the pattern: one method still selects one product. Factory Method requires subclass creation overrides; Abstract Factory creates related product families. Factory vs Builder comparison remains restricted to wedding/birthday because those are the existing builder branches.

Use **Learning view** to switch between **Simple explanation** and **Code structure**. Code structure boxes show actual Java classes/interfaces and members; labeled relationship rows show `extends`, `implements`, method calls, shared references, and creation. Playback highlights matching relationships and Java lines. Switching views pauses playback without losing the step.

Factory examples include a collapsed, keyboard-accessible guide below the walkthrough. Its summary names the selected branch; expanding it shows who chooses the product, every available family, an ordered creation/return sequence, contracts, object lifetime, and extension points. Branch tables update with inputs and use explicit **Selected / Alternative** labels, not color alone. Guides cover Simple Factory, Factory Method, Abstract Factory, and Character Factory; beginner animation remains unchanged.

Invitation Builder and Character Builder reuse the same expandable guide layout, with selected builder labels, every available builder/product branch, current configuration steps, `build()` return types, validation boundaries, mutability differences, and extension points. The invitation guide distinguishes immutable invitation products from the character exercise's mutable builder-as-product design. Prototype also includes an expandable comparison guide illustrating reference sharing (`shallowCopy()`) versus explicit message-buffer copying (`deepCopy()`). Both methods run in the demonstration; neither is an unselected alternative. A null message remains null in either copy. New mutable fields require explicit copy logic. Whiteboard publishes individual writes across threads using a volatile reference; compound read/write workflows still require caller synchronization. Guides remain separate from beginner animation.

Responsive layout: class boxes wrap to available width, relationship text wraps, guide columns stack, phone/tablet controls remain touch-sized, and source code/branch tables scroll inside their panels rather than widening the page. Visual layout has not been browser-verified.

The walkthrough is an explanatory browser illustration, not a Java execution trace. **Run example** remains the source of actual controller output. Shared reference IDs in Singleton and Prototype are illustrative, not JVM memory addresses. No new dependencies.

## HTTP contract

Send `Content-Type: application/json` with a JSON object. Omitted fields use defaults. Successful response: `200`, `{ "explanation": "…", "output": { "label": "value" } }`.

| Pattern | Fields |
| --- | --- |
| `singleton` | `message` (default `Hello from Alice`) |
| `prototype` | `message` (default `Wedding at 6 PM.`), `addition` (default ` Dinner included.`) |
| `simple-factory` | `type`: `wedding` (default), `birthday`, `visiting`, `membership`, `gift`, `playing` |
| `factory-method`, `abstract-factory` | `type`: `wedding` (default), `birthday`, `visiting`, `membership`, `gift`, `playing` |
| `builder` | `type`, `recipient` (`Alice`), `venue` (`Main Hall`), `theme` (`White`), `dressCode` (`Casual`, birthday only) |
| `character-factory` | `type`: `warrior` (default), `mage`, `archer` |
| `character-builder` | `type`, `weapon` (`Greatsword`), `armor` (`Plate Armor`), `specialAbility` (`Berserk Slash`), `level` (10), `comboSkills` (`Shield Bash + Whirlwind`) |

Relevant text must be nonblank and at most 500 characters; level must be an integer from 1 to 100. Invalid input/malformed JSON: `400`. Unknown pattern: `404`. Unsupported content type: `415`. Unrelated fields are ignored.

Singleton intentionally writes process-wide shared Whiteboard state. Do not submit private content. Local teaching tool has no authentication; bind to loopback. Existing application startup configuration and database requirements remain unchanged.

## Checks without browser

```bash
node src/test/patterns-factory.test.mjs
node src/test/patterns-structure.test.mjs
node src/test/patterns-animation.test.mjs
node src/test/patterns-snippets.test.mjs
node --check --input-type=module < src/main/resources/static/patterns.js
./gradlew test --tests com.example.knowledge_sharing.PatternSemanticsTests --tests com.example.knowledge_sharing.PatternControllerTests --tests com.example.knowledge_sharing.DashboardControllerTests --tests com.example.knowledge_sharing.NoteControllerTests
```

Node checks cover input-aware previews, string escaping, factory and builder branch guides, guide visibility/selection changes, text-only rendering, both event families, all character classes, identical comparison payloads, endpoint selection, and request failures/cancellation. Fetch is mocked; these checks do not prove browser rendering or live network behavior. Java controller tests exercise actual pattern classes using standalone Spring MVC without PostgreSQL or Redis.
