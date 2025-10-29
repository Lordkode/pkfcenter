import { createClient, OAuthStrategy } from "@wix/sdk";
import Cookies from "js-cookie";

export const useWixClient = () => {
  const wixClient = createClient({
    auth: OAuthStrategy({
      clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
      tokens: JSON.parse(Cookies.get("session") || '{}')
    }),
  });

  return wixClient;
};
