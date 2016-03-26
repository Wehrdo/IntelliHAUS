/**
 * Created by David on 3/26/2016.
 */

process.on('message', function(message) {
    console.log('worker going to process rule ' + message.ruleId);
    process.send('success');
});

// Notify manager that we are ready to work
process.send('ready');