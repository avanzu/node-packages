import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { EntityRepository, ObjectId } from '@mikro-orm/mongodb';
import { UserRepository } from './userRepository';

@Entity({ repository: () => UserRepository })
export class User {

   @PrimaryKey()
   _id!: ObjectId;

   @SerializedPrimaryKey()
    id!: string; // won't be saved in the database

   @Property()
   fullName!: string;

   @Property()
   email!: string;

   @Property({ lazy: true })
   password!: string;

   @Property({ lazy: true })
   salt!: string

   @Property({ type: 'text' })
   bio = '';

   @Property({ persist: false })
   token?: string

}

