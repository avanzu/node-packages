
# Introduction

**This is a heavily modified version of the original [node-eventstore](https://github.com/thenativeweb/node-eventstore) by Adriano Raiano.**



The project goal is to provide an eventstore implementation for node.js:

-   load and store events via EventStream object
-   event dispatching to your publisher (optional)
-   supported Dbs (inmemory, mongodb, ~~redis, tingodb, elasticsearch, azuretable, dynamodb~~)
-   snapshot support
-   query your events


# Installation

    npm install @avanzu/eventstore

# Usage

## Require the module and init the eventstore:

```javascript
var eventstore = require('@avanzu/eventstore')

var es = eventstore()
```

By default the eventstore will use an inmemory Storage.

### Logging

For logging and debugging you can use [debug](https://github.com/visionmedia/debug) by [TJ Holowaychuk](https://github.com/visionmedia)

simply run your process with

    DEBUG=@avanzu/eventstore/* node app.js

## Provide implementation for storage

example with mongodb:

```javascript
var es = require('@avanzu/eventstore')({
    type: 'mongodb',
    host: 'localhost', // optional
    port: 27017, // optional
    dbName: 'eventstore', // optional
    eventsCollectionName: 'events', // optional
    snapshotsCollectionName: 'snapshots', // optional
    transactionsCollectionName: 'transactions', // optional
    timeout: 10000, // optional
    // emitStoreEvents: true                       // optional, by default no store events are emitted
    // maxSnapshotsCount: 3                        // optional, defaultly will keep all snapshots
    // authSource: 'authedicationDatabase'         // optional
    // username: 'technicalDbUser'                 // optional
    // password: 'secret'                          // optional
    // url: 'mongodb://user:pass@host:port/db?opts // optional
    // positionsCollectionName: 'positions'        // optional, defaultly wont keep position
})
```
<!-- 
example with redis:

```javascript
var es = require('@avanzu/eventstore')({
    type: 'redis',
    host: 'localhost', // optional
    port: 6379, // optional
    db: 0, // optional
    prefix: 'eventstore', // optional
    eventsCollectionName: 'events', // optional
    snapshotsCollectionName: 'snapshots', // optional
    timeout: 10000, // optional
    // emitStoreEvents: true,                   // optional, by default no store events are emitted
    // maxSnapshotsCount: 3                     // optional, defaultly will keep all snapshots
    // password: 'secret'                       // optional
})
```

example with tingodb:

```javascript
var es = require('eventstore')({
    type: 'tingodb',
    dbPath: '/path/to/my/db/file', // optional
    eventsCollectionName: 'events', // optional
    snapshotsCollectionName: 'snapshots', // optional
    transactionsCollectionName: 'transactions', // optional
    timeout: 10000, // optional
    // emitStoreEvents: true,                   // optional, by default no store events are emitted
    // maxSnapshotsCount: 3                     // optional, defaultly will keep all snapshots
})
```

example with elasticsearch:

```javascript
var es = require('eventstore')({
    type: 'elasticsearch',
    host: 'localhost:9200', // optional
    indexName: 'eventstore', // optional
    eventsTypeName: 'events', // optional
    snapshotsTypeName: 'snapshots', // optional
    log: 'warning', // optional
    maxSearchResults: 10000, // optional
    // emitStoreEvents: true,                   // optional, by default no store events are emitted
    // maxSnapshotsCount: 3                     // optional, defaultly will keep all snapshots
})
```

example with custom elasticsearch client (e.g. with AWS ElasticSearch client. Note `http-aws-es` package usage in this example):

```javascript
var elasticsearch = require('elasticsearch');

var esClient = = new elasticsearch.Client({
  hosts: 'SOMETHING.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'us-east-1',
    accessKey: 'REPLACE_AWS_accessKey',
    secretKey: 'REPLACE_AWS_secretKey'
  }
});

var es = require('eventstore')({
  type: 'elasticsearch',
  client: esClient,
  indexName: 'eventstore',
  eventsTypeName: 'events',
  snapshotsTypeName: 'snapshots',
  log: 'warning',
  maxSearchResults: 10000
});
```

example with azuretable:

```javascript
var es = require('eventstore')({
    type: 'azuretable',
    storageAccount: 'nodeeventstore',
    storageAccessKey:
        'aXJaod96t980AbNwG9Vh6T3ewPQnvMWAn289Wft9RTv+heXQBxLsY3Z4w66CI7NN12+1HUnHM8S3sUbcI5zctg==',
    storageTableHost: 'https://nodeeventstore.table.core.windows.net/',
    eventsTableName: 'events', // optional
    snapshotsTableName: 'snapshots', // optional
    timeout: 10000, // optional
    emitStoreEvents: true, // optional, by default no store events are emitted
})
```

example with dynamodb:

```javascript
var es = require('eventstore')({
    type: 'dynamodb',
    eventsTableName: 'events',                  // optional
    snapshotsTableName: 'snapshots',            // optional
    undispatchedEventsTableName: 'undispatched' // optional
    EventsReadCapacityUnits: 1,                 // optional
    EventsWriteCapacityUnits: 3,                // optional
    SnapshotReadCapacityUnits: 1,               // optional
    SnapshotWriteCapacityUnits: 3,              // optional
    UndispatchedEventsReadCapacityUnits: 1,     // optional
    UndispatchedEventsReadCapacityUnits: 1,     // optional
    useUndispatchedEventsTable: true            // optional
    eventsTableStreamEnabled: false             // optional
    eventsTableStreamViewType: 'NEW_IMAGE',     // optional
    emitStoreEvents: true                       // optional, by default no store events are emitted
});
```

DynamoDB credentials are obtained by eventstore either from environment vars or credentials file. For setup see [AWS Javascript SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html).

DynamoDB provider supports [DynamoDB local](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) for local development via the AWS SDK `endpoint` option. Just set the `$AWS_DYNAMODB_ENDPOINT` (or `%AWS_DYNAMODB_ENDPOINT%` in Windows) environment variable to point to your running instance of Dynamodb local like this:

    $ export AWS_DYNAMODB_ENDPOINT=http://localhost:8000

Or on Windows:

    > set AWS_DYNAMODB_ENDPOINT=http://localhost:8000

The **useUndispatchedEventsTable** option to available for those who prefer to use DyanmoDB.Streams to pull events from the store instead of the UndispatchedEvents table. The default is true. Setting this option to false will result in the UndispatchedEvents table not being created at all, the getUndispatchedEvents method will always return an empty array, and the setEventToDispatched will effectively do nothing.

Refer to [StreamViewType](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_StreamSpecification.html#DDB-Type-StreamSpecification-StreamViewType) for a description of the **eventsTableStreamViewType** option

## Built-in event publisher (optional)

if defined the eventstore will try to publish AND set event do dispatched on its own...

### sync interface

```javascript
es.useEventPublisher(function (evt) {
    // bus.emit('event', evt);
})
```

### async interface

```javascript
es.useEventPublisher(function (evt, callback) {
    // bus.sendAndWaitForAck('event', evt, callback);
})
```
-->
## catch connect and disconnect events

```javascript
es.on('connect', function () {
    console.log('storage connected')
})

es.on('disconnect', function () {
    console.log('connection to storage is gone')
})
```

## define event mappings [optional]

Define which values should be mapped/copied to the payload event.

```javascript
es.defineEventMappings({
    id: 'id',
    commitId: 'commitId',
    commitSequence: 'commitSequence',
    commitStamp: 'commitStamp',
    streamRevision: 'streamRevision',
})
```

## initialize

```javascript
await es.init()
```

## working with the eventstore

### get the eventhistory (of an aggregate)

```javascript
const { events } = await es.getEventStream('streamId')
```

or

```javascript
const { events } = await es.getEventStream({
        aggregateId: 'myAggregateId',
        aggregate: 'person', // optional
        context: 'hr', // optional
})
```

'streamId' and 'aggregateId' are the same...
In ddd terms aggregate and context are just to be more precise in language.
For example you can have a 'person' aggregate in the context 'human ressources' and a 'person' aggregate in the context of 'business contracts'...
So you can have 2 complete different aggregate instances of 2 complete different aggregates (but perhaps with same name) in 2 complete different contexts

you can request an eventstream even by limit the query with a 'minimum revision number' and a 'maximum revision number'

```javascript
var revMin = 5,
    revMax = 8 // if you omit revMax or you define it as -1 it will retrieve until the end

const {events} = await es.getEventStream(
    'streamId' || {/* query */ },
    revMin,
    revMax
)
```

store a new event and commit it to store

```javascript
const stream = await es.getEventStream('streamId')

stream.addEvent({ my: 'event' })
stream.addEvents([{ my: 'event2' }])

await stream.commit()
console.log(stream.eventsToDispatch)

```

if you defined an event publisher function the committed event will be dispatched to the provided publisher

if you just want to load the last event as stream you can call getLastEventAsStream instead of ´getEventStream´.

## working with snapshotting

get snapshot and eventhistory from the snapshot point

```javascript
const [snapshot, stream] = await es.getFromSnapshot('streamId')
```

or

```javascript
const [snapshot, stream] = await es.getFromSnapshot({
        aggregateId: 'myAggregateId',
        aggregate: 'person', // optional
        context: 'hr', // optional
    })
```

you can request a snapshot and an eventstream even by limit the query with a 'maximum revision number'

```javascript
var revMax = 8 // if you omit revMax or you define it as -1 it will retrieve until the end

const [snapshot, stream] = es.getFromSnapshot(
    'streamId' || { /* query */ },
    revMax
)
```

create a snapshot point

```javascript
const [snapshot, stream] = await es.getFromSnapshot('streamId')
const snap = snapshot.data
const history = stream.events

// create a new snapshot depending on your rules
if (history.length > myLimit) {
await es.createSnapshot({
    streamId: 'streamId',
    data: myAggregate.getSnap(),
    revision: stream.lastRevision,
    version: 1 // optional
});

// or

await es.createSnapshot({
    aggregateId: 'myAggregateId',
    aggregate: 'person',          // optional
    context: 'hr'                 // optional
    data: myAggregate.getSnap(),
    revision: stream.lastRevision,
    version: 1 // optional
});
}

// go on: store new event and commit it
// stream.addEvents...


```

You can automatically clean older snapshots by configuring the number of snapshots to keep with `maxSnapshotsCount` in `eventstore` options.

## own event dispatching (no event publisher function defined)

```javascript
const evts = await es.getUndispatchedEvents()
```
## Deleting aggregates

currently supported by: 

 1. mongodb 

You can delete an aggregate including the event history, snapshots and transactions by calling `deleteStream`. 
```js
const deletedStream = await es.deleteStream('myStreamId')
```
The return value is the `EventStream` that has just been deleted. 

This stream will contain an undispatched `TombstoneEvent` ready to be processed. 
The `payload` attribute of that event contains the complete event history. 

```js 
const [tombstoneEvent] = deletedStream.eventsToDispatch 
```

## query your events

for replaying your events or for rebuilding a viewmodel or just for fun...

skip, limit always optional

```javascript
var skip = 0,
    limit = 100 // if you omit limit or you define it as -1 it will retrieve until the end

const events = await es.getEvents(skip, limit)

// or

const events = await es.getEvents('streamId', skip, limit)

// or

const events = await es.getEvents(
    {
        // free choice (all, only context, only aggregate, only aggregateId...)
        context: 'hr',
        aggregate: 'person',
        aggregateId: 'uuid',
    },
    skip,
    limit
)
```

by revision

revMin, revMax always optional

```javascript
var revMin = 5,
    revMax = 8 // if you omit revMax or you define it as -1 it will retrieve until the end

const events = await es.getEventsByRevision('streamId', revMin, revMax)
// or

const events = await es.getEventsByRevision(
    {
        aggregateId: 'myAggregateId',
        aggregate: 'person', // optional
        context: 'hr', // optional
    },
    revMin,
    revMax
)
```

by commitStamp

skip, limit always optional

```javascript
var skip = 0,
    limit = 100 // if you omit limit or you define it as -1 it will retrieve until the end

const events = await es.getEventsSince(new Date(2015, 5, 23), skip, limit)

// or

const events = await es.getEventsSince(new Date(2015, 5, 23), limit)

// or

const events = await es.getEventsSince(new Date(2015, 5, 23))
```

## streaming your events

Some databases support streaming your events, the api is similar to the query one

skip, limit always optional

```javascript
var skip = 0,
    limit = 100 // if you omit limit or you define it as -1 it will retrieve until the end

var stream = es.streamEvents(skip, limit)
// or
var stream = es.streamEvents('streamId', skip, limit)
// or by commitstamp
var stream = es.streamEventsSince(new Date(2015, 5, 23), skip, limit)
// or by revision
var stream = es.streamEventsByRevision({
    aggregateId: 'myAggregateId',
    aggregate: 'person',
    context: 'hr',
})

stream.on('data', function (e) {
    doSomethingWithEvent(e)
})

stream.on('end', function () {
    console.log('no more evets')
})

// or even better
stream.pipe(myWritableStream)
```

currently supported by:

1. mongodb

## get the last event

for example to obtain the last revision nr

```javascript
const event = await es.getLastEvent('streamId')

// or

const event = await es.getLastEvent({ // free choice (all, only context, only aggregate, only aggregateId...)
  context: 'hr',
  aggregate: 'person',
  aggregateId: 'uuid'
});
```

## obtain a new id

```javascript
const id = await es.getNewId()
```

## position of event in store

some db implementations support writing the position of the event in the whole store additional to the streamRevision.

currently those implementations support this:

1. inmemory ( by setting ``trackPosition` option )
1. mongodb ( by setting `positionsCollectionName` option)

## special scaling handling with mongodb

Inserting multiple events (documents) in mongodb, is not atomic.
For the eventstore tries to repair itself when calling `getEventsByRevision`.
But if you want you can trigger this from outside:

```javascript
const [firstTransaction] = await es.store.getPendingTransactions()

const lastEvent = await es.store.getLastEvent({
        aggregateId: firstTransaction.aggregateId,
        aggregate: firstTransaction.aggregate, // optional
        context: firstTransaction.context, // optional
})

await es.store.repairFailedTransaction(lastEvent)    

```
# Inspiration

-   Jonathan Oliver's [EventStore](https://github.com/joliver/EventStore) for .net.

# Database Support

Currently these databases are supported:

1. inmemory
2. mongodb ([node-mongodb-native](https://github.com/mongodb/node-mongodb-native))
3. ~~redis ([redis](https://github.com/mranney/node_redis))~~
4. ~~tingodb ([tingodb](https://github.com/sergeyksv/tingodb))~~
5. ~~azuretable ([azure-storage](https://github.com/Azure/azure-storage-node))~~
6. ~~dynamodb ([aws-sdk](https://github.com/aws/aws-sdk-js))~~

## own db implementation

You can use your own db implementation by extending this...

```javascript
var Store = require('@avanzu/eventstore').Store,
    util = require('util'),
    _ = require('lodash')


class MyDB extends Store {
    constructor(options) {
        super(options)
    }
}

module.exports = MyDB
```

and you can use it in this way

```javascript
var es = require('@avanzu/eventstore')({
    type: MyDB,
})
// es.init...
```