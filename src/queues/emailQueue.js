const kue = require('kue');

const queue = kue.createQueue({
    redis: process.env.REDIS_PUBLIC_URL // Use the public Redis URL from Railway
});

module.exports = queue;
