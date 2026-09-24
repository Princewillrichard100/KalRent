import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Verified Nigerian Rental Homes";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "Nigeria";
  const price = searchParams.get("price") || "";
  const count = searchParams.get("count") || "";
  const type = searchParams.get("type") || "Apartments & Flats";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(9, 13, 22, 0) 70%)",
          }}
        />

        {/* Top Navbar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "26px",
                color: "white",
              }}
            >
              K
            </div>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: 900, letterSpacing: "-1px" }}>
              <span>KAL</span>
              <span style={{ color: "#34d399" }}>RENT</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "999px",
              padding: "10px 20px",
              fontSize: "15px",
              fontWeight: 700,
              color: "#6ee7b7",
            }}
          >
            <span>✓</span>
            <span>VERIFIED • ZERO GHOST LISTINGS</span>
          </div>
        </div>

        {/* Middle Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "950px" }}>
          {city ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "20px",
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <span>📍 {city}, {state}</span>
              {count ? <span>• {count}+ Available Listings</span> : null}
            </div>
          ) : null}

          <div
            style={{
              fontSize: "54px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              color: "#f8fafc",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            Direct landlord inspections, title audits, and 100% escrow protection against rental scams.
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #1e293b",
            paddingTop: "30px",
          }}
        >
          {price ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Average Annual Rent
              </span>
              <span style={{ fontSize: "36px", fontWeight: 900, color: "#34d399" }}>
                {price}
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: "18px", color: "#94a3b8", fontWeight: 600 }}>
              Nigeria&apos;s Modern Rental Marketplace
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: "16px",
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            <span>🛡️ Escrow Protected</span>
            <span>⚡ NEPA Band Tracking</span>
            <span>💧 Flood Risk Audited</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
