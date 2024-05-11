import { Type, type Static } from "@sinclair/typebox";

export const SignUpOutputSchema = Type.Object({
    accessToken: Type.String()
})

export type SignUpOutput = Static<typeof SignUpOutputSchema>