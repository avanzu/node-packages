import { createHash, randomBytes } from 'node:crypto'
export class PasswordHash {
    protected salt: string
    constructor(salt?: string) {
        if(null == salt) {
            salt = randomBytes(32).toString('hex')
        }
        this.salt = salt
    }

    async createHash(plainValue: string) : Promise<[string, string]> {
         let hashValue = createHash('md5').update([this.salt, plainValue].join(':')).digest('hex')
         return [hashValue, this.salt]
    }

    async compare(hashValue: string, plainValue: string) {
        let [hashedPlainValue] = await this.createHash(plainValue)
        return hashValue === hashedPlainValue

    }
}