require('./app')({
    amqp: process.env.ACTIVEMQ_URL || 'amqp10://admin@localhost:5672',
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
})
