'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-sg-state-json', 'Describe running instances open ports state. Prints JSON results', function () {
        conf.init(grunt);

        var done = this.async();

        grunt.log.writeln('Getting EC2 Security Groups...');

        aws.log('ec2 describe-security-groups' );
        aws.ec2.describeSecurityGroups({}, aws.capture(function (groups) {

 
            var params = {
                Filters: [{ Name: 'instance-state-name', Values: ['running'] }]
            };

            var groupsState = {};
            groups.SecurityGroups.forEach(function(group){
                groupsState[group.GroupId] = {used: false, name: group.GroupName,instances: []};
            });

            aws.ec2.describeInstances(params, aws.capture(function (result) {
                var instances = _.pluck(result.Reservations, 'Instances');
                var flat = _.flatten(instances);

                grunt.log.ok('Found %s EC2 Security Group(s)', groups.SecurityGroups.length);
                grunt.log.ok('Found %s EC2 Running Instance(s)', flat.length);

                flat.forEach(function(instance){
                    instance.SecurityGroups.forEach(function(group){
                        groupsState[group.GroupId].used = true;
                        groupsState[group.GroupId].instances.push({id: instance.InstanceId, name: _.result(_.find(instance.Tags, { 'Key': 'Name'}), 'Value')});
                    });
                });

                console.log(JSON.stringify(groupsState, null, 2));

                done();
            }));
        }));
    });
};
