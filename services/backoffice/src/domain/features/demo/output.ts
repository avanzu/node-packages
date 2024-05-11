import { Type, type Static } from '@sinclair/typebox'
export const DemoOutputSchema = Type.Object({})

export type DemoOutput = Static<typeof DemoOutputSchema>
