const kue = require('kue');
const queue = kue.createQueue({
    redis: process.env.REDIS_PUBLIC_URL
});
const sendMail = require('../middlewares/emailMiddleware');

queue.process('email', async (job, done) => {
    const { email, subject, message } = job.data;

    try {
        await sendMail(email, subject, message);
        console.log(`✅ Email sent to ${email}`);
        done();
    } catch (err) {
        console.error(`❌ Email failed for ${email}: ${err.message}`);
        done(err);
    }
});

console.log('📩 Email worker is running...');
