import { UseCase } from "@avanzu/kernel";
import { CurrentUser, Feature } from "../../interfaces";
import { DemoPayload, DemoPayloadSchema } from './input'


type Output = {
    message: string
}

@UseCase({id: 'demo', schema: DemoPayloadSchema })
export class DemoFeature implements Feature<DemoPayload, Output>  {

    kind: 'demo' = 'demo'

    constructor(protected currentUser: CurrentUser) {}

    async invoke(value: DemoPayload): Promise<Output> {
        let name = value.name ?? this.currentUser.getUsername()
        let message = `Greetings from ${this.kind} to ${name}`

        return { message }

    }
}