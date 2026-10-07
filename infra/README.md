# infra

Local PostgreSQL (with PostGIS) and Redis for development.

**Nothing uses these until Phase 2** (API, database, worker). Phase 0 only provides and validates the
compose file, so Phase 2 starts with no setup work. The containers were **not** started in Phase 0.

## Use

From the repository root:

```bash
cp .env.example .env
# edit .env and set POSTGRES_PASSWORD to anything you like (it only protects your own machine)
docker compose --env-file .env -f infra/docker-compose.yml up -d
docker compose --env-file .env -f infra/docker-compose.yml ps
```

Stop it with `down`. Add `-v` to also delete the data volumes (this erases the local database).

| Service    | Image                    | Port (this machine only) |
| ---------- | ------------------------ | ------------------------ |
| `postgres` | `postgis/postgis:17-3.5` | 5432                     |
| `redis`    | `redis:8.10-alpine`      | 6379                     |

## Notes

- **No password is stored in the repository.** `docker compose` refuses to start until
  `POSTGRES_PASSWORD` is set, and `.env` is git-ignored.
- **Ports are bound to `127.0.0.1`**, so the database is not reachable from other devices on the network.
- **Pick the PostgreSQL major to match production.** 17 is a default; when the managed database is
  chosen in Phase 2, change the `postgis/postgis` tag to the same major.
- **Apple Silicon:** the official `postgis/postgis` image is built for amd64 only and runs under
  emulation on ARM. That works for development but is slower.
- The image creates the PostGIS extension in the default database on first start. The schema,
  migrations and seed arrive with `packages/db` in Phase 2.
