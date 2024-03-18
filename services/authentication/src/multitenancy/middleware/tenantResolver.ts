import { Next } from "koa";
import { Context, Middleware } from "~/common";
import { Tenant } from "../tenant";

export const tenantResolver: Middleware = async (ctx: Context, next: Next) => {
    const tenantId = String(ctx.query.tenant)
    ctx.state.tenant = new Tenant(tenantId)
    await next()
}