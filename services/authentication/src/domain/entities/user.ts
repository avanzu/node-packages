import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { UserRepository } from './userRepository';

@Entity({ repository: () => UserRepository })
export class User {

   @PrimaryKey()
   _id!: ObjectId;

   @SerializedPrimaryKey()
    id!: string;

   @Property({ index: true, unique: true })
   username!: string;

   @Property({ index: true, unique: true })
   email!: string;

   @Property({ lazy: true })
   password!: string;

   @Property({ lazy: true })
   salt!: string

   @Property({ persist: false })
   token?: string

}

