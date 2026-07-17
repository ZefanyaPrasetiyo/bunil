import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    usernameClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})