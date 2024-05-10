import { Ajv } from 'ajv'
import { Schema, ValidationResult, Validator } from '../interfaces'

export class AJVValidator implements Validator {
    constructor(protected ajv: Ajv) {}

    protected getValidator(schema: Schema) {
        if (false === Boolean(schema.$id)) {
            return this.ajv.compile(schema)
        }
        return this.ajv.getSchema(schema.$id) ?? this.ajv.compile(schema)
    }

    async validate(schema: Schema, data: any): Promise<ValidationResult> {
        let validator = this.getValidator(schema)
        let isValid = Boolean(validator(data))
        return { isValid, errors: validator.errors }
    }
}
