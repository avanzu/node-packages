import { Entity, PrimaryKey, Property, SerializedPrimaryKey, Unique } from '@mikro-orm/core'
import { EntityManager, EntityRepository, ObjectId } from '@mikro-orm/mongodb'

@Entity({ repository: () => SettingsRepository })
export class Settings<T extends {} = {}> {
    @PrimaryKey()
    _id!: ObjectId

    @SerializedPrimaryKey()
    id!: string

    @Property({})
    @Unique()
    name!: string

    @Property({})
    contents!: T

    @Property()
    revision!: number

}

export class SettingsRepository extends EntityRepository<Settings> {
    constructor(em: EntityManager) {
        super(em, Settings)
    }
}
