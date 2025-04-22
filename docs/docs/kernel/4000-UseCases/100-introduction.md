In concept, a UseCase is responsible for handling a single, well-defined action or task within the domain. UseCases are designed to be isolated from the application and infrastructure layers, ensuring a clear separation of concerns within your architecture.

While the application kernel requires UseCases to be implemented as classes, it does not impose strict technical constraints on their structure beyond this requirement. This flexibility allows developers to design UseCases in a way that best suits their specific needs and domain logic.

To ensure consistency and interoperability across different UseCase implementations, it is recommended to define a common interface that all UseCases should follow. This interface standardizes how UseCases are invoked and handle input and output, making it easier to integrate them within the application layer.

One example for such an interface might look like this

```ts
export interface Feature<Input = any, Output = any> {
    invoke(value: Input): Promise<Output>
}