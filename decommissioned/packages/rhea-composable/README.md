# `rhea-composable`

Allows bidirectional and unidirectional messaging using the AMQP 1.0 protocol.
The heavy lifting regarding the messaging protocol is handled courtesy of [rhea](https://www.npmjs.com/package/rhea). 

## Usage
There are two scenarios that are available: [unidirecitonal](#unidirectional) and [bidirectional](#bidirectional) messaging. 

In both cases, you have two independent system components that are unaware of each other. They only share the knowledge of the queue to communicate over and the format of the message(s). 

## connecting to the broker
Both systems will have to establish a connection to the message broker. 
```js
// src/connection.js
const { useConnection } = require('@avanzu/rhea-composable')

const connection = useConnection()
    .connectionOf(
        'my-connection-id', {
            host: process.env.AMQP_HOST, 
            port: process.env.AMQP_PORT,
            username: process.env.AMQP_USER,
            password: process.env.AMQP_PASSWD,
            transport: process.env.AMQP_TRANSPORT,
    })

module.exports = connection

```
This will open a connection to your amqp broker. For a full list of connection options, please refer to the [rhea documentation](https://www.npmjs.com/package/rhea#container). 

> **Attention** 
> 
> typically you can only have exactly one broker connection per IP. Trying to open more than that will most likely cause an exception. 


## unidirectional
> Drop a message into a queue to be processed without expecting a reply. 
> 
> ***A corresponding [example](examples/unidirectional/) can be executed via `npm run examples:uni`***

In this scenario we will have a ***worker*** and a ***dispatcher***.   
### worker setup 
The worker will use the established connection in order to receive and process messages using a map of message handlers.

```js
// src/worker.js
const { useProcessor } = require('@avanzu/rhea-composable')
const connection = require('./connection')


// declare a map of message handlers 
const handlers = {
    mySubject: ({ message }) => {
        console.log('"mySubject" handler received message %o', message)
    },
    default: ({ message }) => {
        console.log('default handler received message %o', message)
    },
}

// attach handlers to the queue
useProcessor(connection).processMessages(
    process.env.WORKER_QUEUE_NAME, 
    handlers
)
```

### dispatcher setup 
The dispatcher will use the established connection in order to add messages to the queue that the worker is processing. 

```js
// src/dispatcher.js

const { useSender } = require('@avanzu/rhea-composable')
const connection = require('./connection')

const sender = useSender().openSender(
    connection, 
    process.env.WORKER_QUEUE_NAME
)

// triggering the subject based handler 
sender.send({ subject: 'mySubject', body: { foo: 'bar' } })

// triggering the default handler
sender.send({ subject: '', body: { bar: 'baz' } })

```

## bidirectional
> Drop a message into a queue to be processed and expect a reply.
> 
> ***A corresponding [example](examples/bidirectional/) can be executed via `npm run examples:bi`***

In this scenario we will have a ***responder*** and a ***requestor***.  

### responder setup 
The responder setup is actually quite similar to the worker setup. The main difference is, that the handlers are supposed to return a reply message. 

```js
// src/responder.js
const { useProcessor } = = require('@avanzu/rhea-composable')
const connection = require('./connection')

// declare a map of message handlers 
const handlers = {
    // subject based message handling
    mySubject: ({ message }) => {
        console.log('Received request for "mySubject" %o', message)
        return {
            subject: 'mySubjectReply',
            body: { received: message },
        }
    },
    default: ({ message }) =>
        new Promise((Ok) => {
            console.log('Received request on default handler %o', message)
            Ok({ body: { received: message } })
        }),
}

// attach handlers to the queue
useProcessor(connection).processMessages(
    process.env.DIALOG_QUEUE_NAME, 
    handlers
)
```

### requestor setup 
The requestor works similar to the dispatcher. Since you do expect a reply, the `send` method does return a promise that you can await.  

You can assign each individual message with a `ttl` in milliseconds. Not doing so will assign a `ttl` of `5000` ms. 

```js
// src/requestor.js

const { useDialog } = = require('@avanzu/rhea-composable')
const connection = require('./connection')

const sender = useDialog(connection)
    .openDialog(process.env.DIALOG_QUEUE_NAME)


// triggering the subject based handler 
sender
    .send({ subject: 'mySubject',  body: { foo: 'bar' } })
    .then(
        (reply) => { console.log('Received reply %o', reply) },
        (error) => { console.error('Received error %o', error)}
    )


// triggering the default handler
sender
    .send({ ttl: 10000, body: { bar: 'baz' }  })
    .then(
        (reply) => { console.log('Received reply %o', reply) },
        (error) => { console.error('Received error %o', error)}
    )  
```

## messaging strategies
In terms of organizing different message types, there are two ways of dealing with them. 

### Single message type queues 
> ...will guarantee that there will only ever be one specific type of message on a specific queue. 

This strategy is advisable when you expect a high volume of time critical messages that should be processed in parallel. 
You will end up with far more queues in the broker but every queue processor has its own receiver so they will be processed in parallel.

### Subject based messages over a single queue
> ...will use a single queue to deliver multiple message types which are distinguished by their `subject`. 

This strategy is advisable when you expect a **few messages occasionally**. You will end up with fewer queues in the broker but processing might take longer when experiencing higher load. 
