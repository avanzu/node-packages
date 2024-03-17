export interface DatabaseConnectorFactory<T> {
    create(tenantId: string) : Promise<T>
}