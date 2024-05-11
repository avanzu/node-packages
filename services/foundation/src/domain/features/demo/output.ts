import { Type, type Static } from '@sinclair/typebox'

export const DemoOutputSchema = Type.Object({
    message:Type.String()
})

export type DemoOutput = Static<typeof DemoOutputSchema>