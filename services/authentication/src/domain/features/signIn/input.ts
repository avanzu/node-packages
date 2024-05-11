import {Type, type Static} from '@sinclair/typebox'
export const SignInInputSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String()
})
export type SignInInput = Static<typeof SignInInputSchema>