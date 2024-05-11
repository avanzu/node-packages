import { Type, type Static } from "@sinclair/typebox";

export const SignUpOutputSchema = Type.Object({
    id: Type.Union([Type.String(), Type.Number(), Type.Symbol()]),
    username: Type.String(),
    token: Type.Optional(Type.String()),
    authenticated: Type.Boolean()
})

export type SignUpOutput = Static<typeof SignUpOutputSchema>