import { PluginHookContext } from './HookContext'
import type { Plugin, RemotePluginDefinition } from './plugin'
import axios from 'axios'
import * as crypto from 'crypto'
import { Type, Static } from '@sinclair/typebox'
import type { Validator } from '~/interfaces'
import { ValidationError } from '~/errors'


export const PluginResponseSchema = Type.Object({
    hook: Type.String(),
    data: Type.Record(Type.String(), Type.Unknown()),
    signature: Type.String()
})

export type PluginResponse = Static<typeof PluginResponseSchema>

export class RemotePlugin implements Plugin {
    constructor(private definition: RemotePluginDefinition, private validator: Validator) {}

    name(): string {
        return this.definition.name
    }
    version(): string {
        return this.definition.version
    }
    dependsOn(): string[] {
        return this.definition.dependsOn
    }
    description(): string {
        throw new Error('Method not implemented.')
    }
    async invoke(context: PluginHookContext): Promise<PluginHookContext> {
        const endpoint = this.definition.hooks[context.hook]
        if(false === Boolean(endpoint)) {
            return context
        }


        try {
            const url = new URL(endpoint, this.definition.baseURL)
            const serializedContext = context.toJSON()
            const response = await axios.post<PluginResponse>(url.toString(), serializedContext)

            const validation = await this.validator.validate(PluginResponseSchema, response.data)
            if(false === validation.isValid){
                throw new ValidationError(validation.errors)
            }

            const { signature, ...data } = response.data

            if (false === this.isSignatureValid(data, signature)) {
                throw new Error('Invalid signature; data may have been tampered with.')
            }

            context.applyDTO(response.data)

            return context

        } catch (error) {
            throw new Error(`Failed to invoke remote plugin ${this.name}: ${error}`)
        }
    }

    private isSignatureValid(data: any, signature: string): boolean {
        const verify = crypto.createVerify('SHA256')
        verify.update(JSON.stringify(data))
        return verify.verify(this.definition.publicKey, signature, 'hex') // Verify the signature
    }
}
