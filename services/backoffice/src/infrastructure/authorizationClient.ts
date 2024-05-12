import { LogAsync } from "@avanzu/decorators";
import { AuthUser, Authorization, AuthorizationResult, Permission } from "@avanzu/kernel";
import axios, { AxiosInstance } from "axios";
import { AuthorizationService } from "~/application/interfaces";

export class AuthorizationClient implements Authorization {
    protected client: AxiosInstance
    constructor(protected options: AuthorizationService, protected authUser: AuthUser) {

        this.client = axios.create({
            ...options,
            timeout: options.timeout || 5000,
            headers: {
                ...options.headers || {},
                Authorization: `Bearer ${this.authUser.token}`
            }
        })

    }

    @LogAsync({ enter: true, exit:true, error: true, args: true, result: true })
    async isGranted(user: AuthUser, permission: Permission): Promise<AuthorizationResult> {
        let payload = { userId: user.id, kind: permission.kind, name: permission.name }
        let response = await this.client.post<AuthorizationResult>('/authentication/isgranted', payload)
        return response.data
    }




}