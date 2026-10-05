import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);
    pinataFormData.append("network", "public");

    const response = await fetch(
    "https://uploads.pinata.cloud/v3/files",
    {
        method: "POST",
        headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataFormData,
    }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "Failed to upload to Pinata",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      cid: data.data.cid,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}