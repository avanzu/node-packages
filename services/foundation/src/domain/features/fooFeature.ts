import { UseCase } from "@avanzu/kernel";
import { CurrentUser, Feature } from "../interfaces";

@UseCase('foo')
export class FooFeature implements Feature  {

    kind: 'foo' = 'foo'

    constructor(protected cache: Cache, protected currentUser: CurrentUser) {}

    async invoke(value: any): Promise<any> {
        return this.kind
    }
}