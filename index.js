var spawn = require('child_process').spawn;

module.exports = function(command, options, callback) {
    // passthru(command, callback)
    if (typeof options == 'function') {
        callback = options;
        options = {};
    }

    // passthru(command)
    if (typeof options == 'undefined') {
        options = {};
    }

    // passthru("ls -la /tmp") => passthru(["ls", "-la", "/tmp"])
    if (typeof command == 'string') {
        command = command.split(' ');
    }

    // command = "ls"
    // args = ["-la", "/tmp"]
    var args = command;
    command = args.shift();

    var child = spawn(command, args, options);
    child.stdout.on('data', function(data) {
        process.stdout.write(data);
    });

    child.stderr.on('data', function(data) {
        process.stderr.write(data);
    });

    // FIXME: process.stdin is not usable in node v0.6.6, see
    // https://github.com/joyent/node/pull/1934

    child.on('exit', function(code, signal) {
        if (!callback) {
            return;
        }

        if (code) {
            var msg = 'Process exit with code ' + code;
            if (signal) {
                msg += ' and signal ' + signal;
            }

            var error = new Error(msg);
            error.code = code;
            error.signal = signal;

            callback(error);
        }

        callback();
    });
};
