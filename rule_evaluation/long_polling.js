/**
 * Created by David on 3/28/2016.
 */
var EventEmitter = require('events').EventEmitter;

var updatesBus = new EventEmitter();
updatesBus.setMaxListeners(Infinity);

// All the updates that failed to send
var updates_backlog = [];

// Number of milliseconds to keep an update for
var BACKLOG_MAX_AGE = 60 * 60000;
// Runs through all the failed updates to send them again
function tryBacklogs() {
    var now = new Date();
    var i = updates_backlog.length - 1;
    while (i >= 0) {
        var update = updates_backlog[i];
        var success = updatesBus.emit(update.homeId, update.update_info);
        if (success || ((now - update.time) > BACKLOG_MAX_AGE)) {
            updates_backlog.splice(i, 1);
        }
        i -= 1;
    }
}

// Try re-emitting backlogs every 10 seconds
setInterval(tryBacklogs, 10000);

exports.updatesBus = updatesBus;
exports.updates_backlog = updates_backlog;