'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var lookup = require('./lib/lookup.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-stop', 'Stops the EC2 instance', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2-stop:name')
            ].join('\n'));
        }

        var done = this.async();

        lookup(name, function (instance) {
            var id = instance.InstanceId;
            var params = {
                InstanceIds: [id]
            };

            grunt.log.writeln('Stopping EC2 instance %s...', chalk.magenta(id));
            aws.log('ec2 stop-instances --instance-ids %s', id);
            aws.ec2.stopInstances(params, aws.capture(function(){
                grunt.log.ok('Waiting for instance to stop');
                aws.ec2.waitFor('instanceStopped', params, function(err, data) {
                    if (err) grunt.log.ko('Error stopping instance %s', err); // an error occurred
                    else grunt.log.ok('Instance stopped successfully');
                    done();
                });
            }));
        });
    });
};
