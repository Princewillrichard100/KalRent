## 2025-05-18 - PostGIS Coordinate Extraction Optimization
**Learning:** Returning PostGIS spatial points via Prisma `findMany` or `findUnique` followed by a secondary raw query `SELECT ST_asText(coordinates)` and JavaScript WKT string parsing (`wktToGeoJSON`) creates an N+1 query pattern and heavy CPU parsing overhead for list endpoints.
**Action:** Use single `prisma.$queryRaw` queries with `json_build_object` and PostGIS `ST_X` / `ST_Y` to project coordinates directly into JSON responses in one database roundtrip.
