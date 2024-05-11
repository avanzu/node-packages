import {Type, type Static} from '@sinclair/typebox'
export const SignUpInputSchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    email: Type.String({ format: 'email'}),
    bio: Type.Optional(Type.String({ default : '' }))
})
export type SignUpInput = Static<typeof SignUpInputSchema>