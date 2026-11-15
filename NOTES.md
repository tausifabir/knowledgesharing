# Local notes

Requires Java 25 and PostgreSQL database `db_sharing` at `localhost:5432`.
The database must already exist. Startup creates `sharing_notes` if absent; it does not drop existing data.
The configured DB user needs permission to create the table and read/insert rows.

```bash
export DB_USERNAME=postgres # Change to your PostgreSQL user.
read -rsp 'PostgreSQL password: ' DB_PASSWORD; printf '\n'
export DB_PASSWORD
./gradlew bootRun
```

Open http://127.0.0.1:8080/ . Optional `DB_URL` overrides the JDBC URL.
Local-only demo: no authentication; do not expose it beyond loopback without access controls.
Existing Redis session dependency remains unchanged; this page does not use sessions.

## HTTP contract

- `GET /api/notes`: `200`, JSON array of latest 100 notes, descending ID.
- `POST /api/notes`: requires `Content-Type: application/json` and JSON object with `title` (1–200 characters) and `content` (1–10000 characters). Both must be nonblank. Values are stripped before insertion.
- Successful POST: `201`, inserted note: `{ "id": 1, "title": "Example", "content": "Body", "createdAt": "2026-11-15T12:00:00Z" }`.
- Invalid input or malformed JSON: `400`. Unsupported content type: `415`.
- Database operation failure: `503`, JSON message. Refresh before retrying if save outcome is uncertain.
- Notes render as text, not HTML. No edit/delete endpoints.

## Checks

```bash
./gradlew test --tests com.example.knowledge_sharing.NoteControllerTests
curl --fail-with-body http://127.0.0.1:8080/api/notes
curl --fail-with-body -i http://127.0.0.1:8080/api/notes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Example","content":"Saved in PostgreSQL"}'
```

Controller tests use mocked JDBC: they check validation and trimmed parameters, not live SQL or persistence.
Full Spring context tests require configured PostgreSQL credentials.
