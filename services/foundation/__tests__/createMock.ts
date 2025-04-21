export function createMock<T>(mock: Partial<T>): jest.Mocked<T> {
    return mock as jest.Mocked<T>
}