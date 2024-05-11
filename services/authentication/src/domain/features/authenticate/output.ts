import { Type, type Static } from "@sinclair/typebox";

export const AuthenticateOutputSchema = Type.Object({
    accessToken: Type.String()
})

export type AuthenticateOutput = Static<typeof AuthenticateOutputSchema>