#!/usr/bin/env node

/* eslint-disable no-console */
const yargs = require('yargs');
const { default: Auto } = require('./lib/auto');

const { argv } = yargs
    .parserConfiguration({
        'parse-numbers': false,
    })
    .usage(
        'Usage: code-builder -h <host> -d <database> -u <user> -x [password] -p [port] -t [tableName] -m [template] -c [templateConfigPath] -n [params] -s [paramsFilePath] -r [saveFileRootPath]'
    )
    .option('host', {
        description: 'IP/Hostname for the database.',
        type: 'string',
        alias: 'h',
    })
    .option('database', {
        description: 'Database name.',
        type: 'string',
        alias: 'd',
    })
    .option('user', {
        description: 'Username for database. Default: root',
        type: 'string',
        alias: 'u',
    })
    .option('password', {
        description: 'Password for database.',
        alias: 'x',
    })
    .option('port', {
        description: 'Port number for database. Default: 3306',
        type: 'number',
        alias: 'p',
    })
    .option('tableName', {
        description:
            'Names of tables to import. Multiple use `,` separate. If there is no password, export all tables. Ex: user,role',
        type: 'string',
        alias: 't',
    })
    .option('template', {
        description: 'Using built-in template. Ex: default/eggjs. Default: default',
        type: 'string',
        alias: 'm',
    })
    .option('templateConfigPath', {
        description: 'Using custom template. Template file path.',
        type: 'string',
        alias: 'c',
    })
    .option('params', {
        description: 'Custom params. Ex: key1=value&key2=value',
        type: 'string',
        alias: 'n',
    })
    .option('paramsFilePath', {
        description: 'Custom params file path. JSON format file.',
        type: 'string',
        alias: 's',
    })
    .option('saveFileRootPath', {
        description: 'Save file root directory. Default: current directory',
        type: 'string',
        alias: 'r',
    })
    .check((argvs) => Boolean(argvs.host && argvs.password && argvs.database));

(async () => {
    const cwd = process.cwd();

    await new Auto(argv.host, argv.password, argv.database, {
        user: argv.user,
        port: argv.port,
        tableName: argv.tableName,
        template: argv.template,
        templateConfigPath: argv.templateConfigPath,
        params: argv.params,
        paramsFilePath: argv.paramsFilePath,
        saveFileRootPath: argv.saveFileRootPath || cwd,
    }).run();

    process.exit(0);
})().catch((err) => {
    if (err.stack) {
        console.error(err.stack);
    } else if (err.message) {
        console.error(err.message);
    } else {
        console.error(err);
    }

    process.exit(1);
});
