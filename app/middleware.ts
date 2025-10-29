import { createClient, OAuthStrategy } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (!request.cookies.get("session")) {
    const response = NextResponse.next();
    const myWixClient = createClient({
      auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
    });

    response.cookies.set(
      "session",
      JSON.stringify(await myWixClient.auth.generateVisitorTokens())
    );
    return response;
  }
}
