import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #001e40 0%, #003366 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(0, 108, 71, 0.15)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(138, 245, 190, 0.08)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 80px",
            gap: "20px",
          }}
        >
          {/* Logo area */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* House icon */}
            <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.15)" />
              <path d="M6 17L16 7L26 17V27H20V21H12V27H6V17Z" fill="white" />
              <rect x="13" y="12" width="6" height="5" rx="1" fill="#006c47" />
            </svg>
            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-1px",
                }}
              >
                Vina
              </span>
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  color: "#8af5be",
                  letterSpacing: "-1px",
                }}
              >
                Estate
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              maxWidth: "800px",
              letterSpacing: "-1px",
            }}
          >
            {`N\u1EC1n t\u1EA3ng B\u1EA5t \u0110\u1ED9ng S\u1EA3n`}
            <br />
            {`h\u00E0ng \u0111\u1EA7u Vi\u1EC7t Nam`}
          </div>

          {/* Accent line */}
          <div
            style={{
              width: "120px",
              height: "4px",
              background: "linear-gradient(90deg, #006c47, #8af5be)",
              borderRadius: "2px",
              display: "flex",
            }}
          />

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              marginTop: "20px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{ fontSize: "32px", fontWeight: 800, color: "#8af5be" }}
              >
                4,500+
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "2px",
                }}
              >
                {`B\u0110S \u0110ANG B\u00C1N`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{ fontSize: "32px", fontWeight: 800, color: "#8af5be" }}
              >
                63
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "2px",
                }}
              >
                {`T\u1EC8NH TH\u00C0NH`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{ fontSize: "32px", fontWeight: 800, color: "#8af5be" }}
              >
                24/7
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "2px",
                }}
              >
                {`H\u1ED6 TR\u1EE2`}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "6px",
            background: "linear-gradient(90deg, #006c47, #8af5be, #006c47)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
