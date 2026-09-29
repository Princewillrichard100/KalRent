# Bolt's Performance Journal

## 2025-02-22 - PostGIS Location Queries Optimization in Prisma
**Learning:** Performing Prisma queries that fetch locations followed by `Promise.all` with per-item raw SQL queries (`SELECT ST_asText(...)`) and JS library parsing (`wktToGeoJSON`) creates severe N+1 query overhead and latency spikes. Constructing `location` objects directly using `json_build_object`, `ST_X`, and `ST_Y` within a single `$queryRaw` query eliminates N+1 database roundtrips and JS CPU overhead completely.
**Action:** Always prefer single `$queryRaw` queries with `json_build_object` and `ST_X`/`ST_Y` when retrieving spatial entities and their locations.
