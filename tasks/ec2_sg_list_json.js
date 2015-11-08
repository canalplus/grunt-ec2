'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var aws = require('./lib/aws.js');
var conf = require('./lib/conf.js');

module.exports = function (grunt) {

    grunt.registerTask('ec2-sg-list-json', 'Lists security groups. Prints JSON results', function () {
        conf.init(grunt);

        var done = this.async();
        var params = {};

        grunt.log.writeln('Getting EC2 Security Groups...');

        aws.log('ec2 describe-security-groups' );
        aws.ec2.describeSecurityGroups(params, aws.capture(function (result) {

            grunt.log.ok('Found %s EC2 Security Group(s)', result.SecurityGroups.length);
            console.log(JSON.stringify(result.SecurityGroups, null, 2));

            done();
        }));
    });
};
