import { findFreePorts } from 'find-free-ports'
import { asyncConfig } from 'config/async'
export default {
    port: asyncConfig(async () => (await findFreePorts(1)).at(0)),
    namespace: '/foo/bar'
}
