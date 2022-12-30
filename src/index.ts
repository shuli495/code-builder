#!/usr/bin/env node

import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ora from 'ora';
import chalk from 'chalk';
import Auto from './auto.mjs';
import { cmdConfig, optionsNameType, inquirerQuestionsSchema, inquirerQuestions, language } from './common/config.mjs';

const argv = await yargs(hideBin(process.argv))
    .usage('eg: code-file-builder -h 127.0.0.1 -d test -x 123456 -m pighand-spring')
    .command(
        'guide',
        cmdConfig.command.guide[language],
        async (yargs: any) => {
            yargs.middleware(async (argv: any) => {
                const promptQuestions = async (questions: Array<inquirerQuestionsSchema>) => {
                    for (const question of questions) {
                        const { children = [], name } = question;
                        const inputInfos = await inquirer.prompt([question]);

                        const inputValue = inputInfos[name];
                        argv[name] = inputValue;

                        if (cmdConfig[name as optionsNameType].alias) {
                            argv[cmdConfig[name as optionsNameType].alias] = inputValue;
                        }

                        for (const childrenItem of children) {
                            const { parent = [], questions = [] } = childrenItem;

                            const isChild = parent.length && parent.includes(inputValue);

                            if (isChild && questions.length) {
                                await promptQuestions(questions);
                            }
                        }
                    }
                };

                await promptQuestions(inquirerQuestions);

                return argv;
            }, false);
        },
        (argv: any) => {}
    )
    .option(cmdConfig.type.name, {
        description: cmdConfig.type.description[language],
        choices: cmdConfig.type.choices,
        alias: cmdConfig.type.alias,
        default: cmdConfig.type.default,
    })
    .option(cmdConfig.host.name, {
        type: 'string',
        description: cmdConfig.host.description[language],
        alias: cmdConfig.host.alias,
        default: cmdConfig.host.default,
    })
    .option(cmdConfig.port.name, {
        type: 'number',
        description: cmdConfig.port.description[language],
        alias: cmdConfig.port.alias,
        default: cmdConfig.port.default(),
    })
    .option(cmdConfig.user.name, {
        type: 'string',
        description: cmdConfig.user.description[language],
        alias: cmdConfig.user.alias,
        default: cmdConfig.user.default,
    })
    .option(cmdConfig.password.name, {
        description: cmdConfig.password.description[language],
        alias: cmdConfig.password.alias,
    })
    .option(cmdConfig.database.name, {
        type: 'string',
        description: cmdConfig.database.description[language],
        alias: cmdConfig.database.alias,
    })
    .option(cmdConfig.tableName.name, {
        type: 'string',
        description: cmdConfig.tableName.description[language],
        alias: cmdConfig.tableName.alias,
        array: true,
    })
    .option(cmdConfig.template.name, {
        type: 'string',
        description: cmdConfig.template.description[language],
        choices: cmdConfig.template.choices(),
        alias: cmdConfig.template.alias,
    })
    .option(cmdConfig.templatePath.name, {
        type: 'string',
        description: cmdConfig.templatePath.description[language],
        alias: cmdConfig.templatePath.alias,
    })
    .option(cmdConfig.params.name, {
        type: 'string',
        description: cmdConfig.params.description[language],
        alias: cmdConfig.params.alias,
    })
    .option(cmdConfig.paramsPath.name, {
        type: 'string',
        description: cmdConfig.paramsPath.description[language],
        alias: cmdConfig.paramsPath.alias,
    })
    .option(cmdConfig.saveFileRootPath.name, {
        type: 'string',
        description: cmdConfig.saveFileRootPath.description[language],
        alias: cmdConfig.saveFileRootPath.alias,
        default: cmdConfig.saveFileRootPath.default,
    })
    .group(['host', 'port', 'user', 'password', 'database', 'tableName'], cmdConfig.group.db[language])
    .group(['template', 'templatePath', 'params', 'paramsPath'], cmdConfig.group.template[language])
    .check((argv: any) => {
        // 参数校验，忽略命令操作
        const { _, database, template, templatePath } = argv;
        if (!_[0]) {
            if (!database) {
                return cmdConfig.check.demand[language] + 'database';
            }

            if (!template && !templatePath) {
                return cmdConfig.check.templateOrPath[language];
            }
        }

        return true;
    })
    .parse();

const spinner = ora(chalk.blue(cmdConfig.ora.building[language]));
try {
    const { _ } = argv;

    // 引导方式，拼接cmd命令，方便下次直接使用
    if (_[0]) {
        let cmd = 'code-file-builder';
        Object.keys(cmdConfig).forEach((key: optionsNameType) => {
            const value = cmdConfig[key];
            const { alias, name } = value;

            if (argv[key]) {
                cmd += (alias ? ` -${alias} ` : ` --${name} `) + argv[key];
            }
        });

        console.log(`> ${chalk.yellow(cmd)}`);
    }

    spinner.start();

    await new Auto(argv as any, spinner).run();

    spinner.stopAndPersist({
        text: `${cmdConfig.ora.success[language]}`,
        symbol: '🍺',
    });
} catch (e) {
    spinner.fail(`${cmdConfig.ora.fail[language]}: ${e.message}`);
}
