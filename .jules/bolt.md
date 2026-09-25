## 2025-02-23 - PostGIS Spatial Query Batching & N+1 Prevention
**Learning:** `Promise.all` mapping over Prisma query results to perform raw SQL `ST_asText` PostGIS spatial queries per property creates severe N+1 database roundtrips and costly JS parsing. PostGIS `ST_X` and `ST_Y` can extract numerical coordinates directly in a single batch query (`WHERE id = ANY(...)`).
**Action:** Use batch SQL queries (`id = ANY(...)`) with `ST_X`/`ST_Y` when fetching spatial coordinates for list endpoints instead of executing raw queries inside `map` loops.
