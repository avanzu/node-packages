export interface Schema {
    $id?: string
}

export interface ValidationResult {
    isValid: boolean
    errors: any[]
}
export interface Validator {
    validate(schema: Schema, data: any) : Promise<ValidationResult>
}