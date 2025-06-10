import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: `url(https://alialshehri.works/og-bg.png)`,
        }}
      >
        <div
          style={{
            marginLeft: 160,
            marginRight: 190,
            fontSize: 55,
            fontFamily: "saans-font",
            letterSpacing: "-0.05em",
            color: "white",
            lineHeight: "80px",
            whiteSpace: "pre-wrap",
          }}
        >
          Ali Alshehri
        </div>

        <div
          style={{
            width: "80%",
            marginLeft: 150,
            marginRight: 190,
            marginTop: -10,
            display: "flex",
            fontSize: 80,
            fontFamily: "saans-font",
            letterSpacing: "-0.05em",
            fontWeight: 900,
            color: "white",
            whiteSpace: "pre-wrap",
            lineHeight: "75px",
          }}
        >
          {`${postTitle} - Blog Post`}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
