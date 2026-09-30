## 2025-05-18 - Single-query PostGIS Location Retrieval
**Learning:** Performing `prisma.property.findUnique` followed by a separate `prisma.$queryRaw` query using `ST_asText` + `wktToGeoJSON` creates an unnecessary DB round-trip and extra CPU overhead for coordinate parsing when fetching individual property details.
**Action:** Use a single `prisma.$queryRaw` query constructed with `json_build_object` and `ST_X` / `ST_Y` to retrieve property and coordinates in a single database round-trip without JS WKT parsing.
