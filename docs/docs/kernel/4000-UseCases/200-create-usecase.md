---

title: Creating UseCases
sidebar_label: Creating UseCases
---

Assuming that you are using an interface similar to the one provided as example, let's imagine that the problem domain revolves around authentication.

One such single, well-defined operation could be a user login.

```ts
// ./src/domain/features/loginFeature.ts

import * as Kernel from '@avanzu/kernel'

export type LoginInput = {
    username: string
    password: string
}

export type LoginOutput = {
    token: string
    userId: string
}

export class LoginUseCase implements Feature<LoginInput, LoginOutput> {

    constructor(
        private userRepository: UserRepository,
        private authenticator: Authenticator
    ){}

    async invoke(value: LoginInput) : Promise<LoginOutput> {

        const user = await this.userRepository.findByUsername(value.username)
        const passwordHash = this.authenticator.hashPassword(value.password)
        if(user.password === passwordHash) {
            const token = await this.authenticator.createToken(user)
            return { token, userId: user.id }
        }
        throw new Error('NotAuthenticated')
    }
}

```
The UseCase itself is a relatively simple class. As you may have noticed, this UseCase expects two dependencies to be injected. Both of them revolve around a third type, the `user` which also needs to be defined.

Let's start to define the `User` interface which both components rely on. At least so far as we can extrapolate by now.

```ts
// ./src/domain/interfaces/user.ts
export interface User {
    id: string
    username: string
}
```
Now, we can declare the remaining two interfaces based on how we intend to use them in our UseCase.

```ts
// ./src/domain/interfaces/authenticator.ts
import type { User } from './user'

export interface Authenticator {
    createToken(user: User) : Promise<string>
    hashPassword(passwordString: string) : string
}
```
```ts
// ./src/domain/interfaces/userRepository.ts
import type { User } from './user'

export interface UserRepository {
    findByUsername(username: string) : Promise<User>
}
```
That's almost all we need to do in the domain layer.

### Interface implementations
Now that we have declared our interfaces, we need to provide at least one concrete implementation in order to end up with a working login feature.

> [!WARNING]
> keep in mind, that the following implementations are kept extremely simple and only serve demonstrative purposes in context of this document.

#### User entity
Since the `User` is apparently a concept that exists in the business domain, the concrete implementation of the interface also needs to exist in the domain layer, we could replace the interface with a concrete entity class.

```ts
// ./src/domain/entities/user.ts

export class User {
    id!: string
    username!: string
    password!: string

    constructor(id?: string, username?: string, password?: string) {
        this.id = id
        this.username = username
        this.password = password
    }
}
```
#### MD5Authenticator
In the spirit of keeping things simple, we implement the authenticator interface which used and MD5 hash to authenticate the given user with the given passowrd string.

```ts
import type { Authenticator } from '~/domain/interfaces'
import { User } from '~/doamin/entities'
import { createHash, randomBytes } from 'node:crypto'

export class MD5Authenticator implements Authenticator {

    async createToken(user: User) : Promise<string> {
        return randomBytes(65).toString('hex')
    }

    hashPassword(passwordString: string): string {
        return createHash('md5').update(passwordString).digest('hex')
    }
}
```

#### InMemoryUserRespository
To keep it relatively simple, we first impelement the `UserRepository` as in memory storage.

```ts
// ./src/infrastructure/inMemoryUserRepository.ts

import type { UserRepository, Authenticator } from '~/domain/interfaces'
import { User } from '~/domain/entities'

export class InMemoryUserRepository implements UserRepository {
    private users: User[]
    constructor(private authenticator: Authenticator) {
        this.users = [
            new User(
                '012ae4d3',
                'Joseph',
                authenticator.hashPassword('qtZm4vzVv7')
            )
        ]
    }

    async findByUsername(username: string) : Promise<User> {
        const user = this.users.find((user) => user.username === username)
        if(false === Boolean(user)) {
            throw new Error('UserNotFound')
        }

        return user
    }
}
```