'use strict';

var chalk = require('chalk');
var aws = require('./lib/aws.js');
var lookup = require('./lib/lookup.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-start', 'Starts the EC2 instance', function (name) {
        conf.init(grunt);

        if (arguments.length === 0) {
            grunt.fatal([
                'You should provide an instance name.',
                'e.g: ' + chalk.yellow('grunt ec2-start:name')
            ].join('\n'));
        }

        var done = this.async();

        lookup(name, function (instance) {
            var id = instance.InstanceId;
            var params = {
                InstanceIds: [id]
            };

            grunt.log.writeln('Starting EC2 instance %s...', chalk.magenta(id));
            aws.log('ec2 start-instances --instance-ids %s', id);
            aws.ec2.startInstances(params, aws.capture(function(){
                grunt.log.ok('Waiting for instance to start');
                aws.ec2.waitFor('instanceRunning', params, function(err, data) {
                    if (err) grunt.log.ko('Error starting instance %s', err); // an error occurred
                    else grunt.log.ok('Instance started successfully');
                    done();
                });
            }));
        });
    });
};
