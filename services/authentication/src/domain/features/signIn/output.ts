import { Type, type Static } from "@sinclair/typebox";

export const SignInOutputSchema = Type.Object({
    accessToken: Type.String()
})

export type SignInOutput = Static<typeof SignInOutputSchema>