import { AuthorizationResult } from '@avanzu/kernel'
import { Type, type Static } from '@sinclair/typebox'
export const IsGrantedOutputSchema = Type.Enum(AuthorizationResult)

export type IsGrantedOutput = Static<typeof IsGrantedOutputSchema>
