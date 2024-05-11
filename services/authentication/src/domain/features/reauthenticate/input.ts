import {Type, type Static} from '@sinclair/typebox'
export const ReauthenticateInputSchema = Type.Object({
    token: Type.String()
})
export type ReauthenticateInput = Static<typeof ReauthenticateInputSchema>