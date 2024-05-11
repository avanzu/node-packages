import { Type, type Static } from "@sinclair/typebox";

export const ReauthenticateOutputSchema = Type.Object({
    accessToken: Type.String()
})

export type ReauthenticateOutput = Static<typeof ReauthenticateOutputSchema>