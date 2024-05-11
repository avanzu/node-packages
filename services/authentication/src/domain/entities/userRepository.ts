import { EntityRepository, EntityManager } from "@mikro-orm/mongodb";
import { User } from "./user";

export class UserRepository extends EntityRepository<User> {
    constructor(em: EntityManager) {
        super(em, User)
    }
}