import { Type, type Static } from '@sinclair/typebox'
export const DemoInputSchema = Type.Object({})

export type DemoInput = Static<typeof DemoInputSchema>
