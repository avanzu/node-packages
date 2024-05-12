import { PermissionKind } from '@avanzu/kernel'
import { Type, type Static } from '@sinclair/typebox'
export const IsGrantedInputSchema = Type.Object({
    kind: Type.Enum(PermissionKind),
    name: Type.String()
})

export type IsGrantedInput = Static<typeof IsGrantedInputSchema>
