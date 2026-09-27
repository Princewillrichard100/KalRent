## 2025-05-20 - Consolidating PostGIS Spatial Queries to Avoid N+1 Lat/Lng Resolving

**Learning:** In PostGIS schemas with `geography(Point, 4326)` columns, fetching relations via Prisma ORM (`findMany` or `findUnique`) and then querying `ST_asText(coordinates)` in a loop via `prisma.$queryRaw` causes N+1 database round-trips and Node.js WKT parsing overhead. PostGIS functions `ST_X` and `ST_Y` combined with PostgreSQL `json_build_object` allow constructing full spatial objects directly inside a single raw SQL query.

**Action:** When fetching spatial entities and locations in PostGIS applications, construct nested JSON objects using `json_build_object` and `ST_X`/`ST_Y` in a single `$queryRaw` call rather than doing follow-up queries or client-side WKT conversions.
