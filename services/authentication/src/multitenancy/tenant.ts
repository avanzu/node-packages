export class Tenant {

    constructor(protected id: string) {}

    getId() : string {
        return this.id
    }
}