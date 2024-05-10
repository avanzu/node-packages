import { Type, type Static } from '@sinclair/typebox'

export const DemoPayloadSchema = Type.Object({
    name:Type.String()
})

export type DemoPayload = Static<typeof DemoPayloadSchema>