---

title: OpenAPI Integration
sidebar_label: OpenAPI Integration
---

In the kernel architecture, **controllers are intentionally positioned as boundary components** — minimal integration or glue code responsible for handling HTTP concerns. As such, it’s perfectly fine to go all-in on tightly coupling them with kernel-provided decorators and tooling, including automatic OpenAPI documentation generation.

This keeps the domain code clean and unaffected by infrastructure concerns, while still offering a rich, declarative interface at the edges of the system.

## Key Concepts

- `@ApiDocs()` — Assigns OpenAPI metadata to controllers or methods.
- `@Contract()` — Describes endpoint behavior, including summary, parameters, and response shapes.

## How It Works

Controllers and endpoints can be annotated with OpenAPI metadata. A dedicated endpoint can then expose a generated OpenAPI JSON spec, ready for Swagger UI or Redoc.

### Controller Example

```ts
@ApiDocs({
  tag: {
    name: 'Maintainance',
    description: 'Maintainance related endpoints helping to operate the service properly',
  }
})
@Controller()
export class AppController {
  constructor(protected info: AppInfo) {}

  @Get('/health')
  async getHealth(context: Context) {
    context.status = 200
    context.body = 'OK'
  }

  @Get('/specs.json')
  async generateApiDocs(context: Context) {
    const generator = new OpenApi({
      description: this.info.description,
      version: this.info.version,
      title: this.info.name,
    }, context.scope)

    context.body = generator.generate()
  }
}
```

> **Note**: You can define your own `/specs.json` route or any custom route to serve the generated spec.

### Endpoint Example

You can use the `@Contract()` decorator to provide detailed OpenAPI metadata for an endpoint:

```ts
@ApiDocs({ tag: { name: 'Audit', description: 'View audit logs' } })
@Controller('/audit', authenticate('jwt'))
export class AuditController {

  constructor(private auditRepository: AuditRepository) {}

  @Contract({
    info: () => ({ summary: 'Get paginated audit logs' }),
    query: () => AuditQuery,
    response: () => ({ 200: Paginated(AuditLogSchema) }),
    errorCodes: () => [400, 401, 403, 500],
  })
  @Get('/')
  async listAuditRecords(context: Context) {
    const result = await this.auditRepository.find(context.query)
    context.body = result
  }
}
```

## Best Practices

- **Embrace Controller Coupling**: It’s okay to deeply integrate controllers with decorators — they are not part of your domain model.
- **Keep Contracts Close**: Defining query and response types inline via `@Contract()` ensures they’re never out of sync.
- **Use JSON Schema**: Contracts rely on JSON schema-compatible declarations to ensure tooling like Swagger can interpret them.
- **Expose via Controller**: Since spec generation is just another handler, you decide where and how to expose it.

