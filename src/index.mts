#!/usr/bin/env node

import fs from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import moment from 'moment';
import yargs from 'yargs';
import inquirer from 'inquirer';
import { hideBin } from 'yargs/helpers';

import Auto from './auto.mjs';
import {
    projectName,
    historyInterface,
    historyFile,
    cmdConfig,
    optionsNameType,
    inquirerSchema,
    inquirerGuide,
    inquirerHistory,
    language,
} from './common/config.mjs';

// 组装cmd
const assembleCmd = (argv) => {
    const { _ } = argv;

    // 拼接cmd命令
    let cmd = 'code-file-builder';
    Object.keys(cmdConfig).forEach((key: optionsNameType) => {
        const value = cmdConfig[key];
        const { alias, name } = value;

        if (argv[key]) {
            cmd += (alias ? ` -${alias} ` : ` --${name} `) + argv[key];
        }
    });

    // 引导方式，显示cmd命令
    if (_[0]) {
        console.log(`> ${chalk.yellow(cmd)}`);
    }

    return cmd;
};

// 读取历史记录
const getHistory = () => {
    let historyArray: Array<historyInterface> = [];
    try {
        const historyText = fs.readFileSync(historyFile);
        historyArray = JSON.parse(historyText.toString());
    } catch (e) {}

    return historyArray;
};

// 保存历史记录，最多100条
const saveHistory = (cmd) => {
    // 记录历史
    const historyArray = getHistory();

    historyArray.push({
        time: moment().format('yyyy-MM-dd hh:mm:ss'),
        cmd,
    });

    try {
        fs.writeFileSync(historyFile, JSON.stringify(historyArray.slice(-100)));
    } catch (e) {
        console.log(e.message);
    }
};

const argv = await yargs(hideBin(process.argv))
    .usage('eg: code-file-builder -h 127.0.0.1 -d test -x 123456 -m pighand-spring')
    .command(
        'guide',
        cmdConfig.command.guide[language],
        async (yargs: any) => {
            yargs.middleware(async (argv: any) => {
                const promptQuestions = async (questions: Array<inquirerSchema>) => {
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

                await promptQuestions(inquirerGuide);

                return argv;
            }, false);
        },
        (argv: any) => {}
    )
    .command(
        'history',
        cmdConfig.command.history[language],
        async (yargs: any) => {
            yargs.middleware(async (argv: any) => {
                try {
                    let index = 1;
                    const history = getHistory().map((item) => `${index++}) ${item.time} | ${item.cmd}`);

                    // 无历史记录直接退出
                    if (!history || history.length == 0) {
                        console.log(chalk.yellow(inquirerHistory[0].noHistoryConsole));
                        process.exit();
                    }

                    inquirerHistory[0].choices = history;
                    const inputInfos = await inquirer.prompt(inquirerHistory);

                    const choseCmd = inputInfos[inquirerHistory[0].name];

                    // 解析历史记录命令
                    const cmdArgv = choseCmd
                        .split('|')[1] // 去掉日期
                        .replace(projectName, '') // 替换命令开头项目名
                        .trim()
                        .split(' ');

                    // 将命令行list转为{参数名: 参数值}的格式；参数如果是别名，去掉前面的“-”
                    const argvMap = {};
                    let tmpKey = '';
                    cmdArgv.forEach((item) => {
                        if (!tmpKey) {
                            tmpKey = item.startsWith('-') ? item.replace('-', '') : item;
                        } else {
                            argvMap[tmpKey] = item;
                            tmpKey = '';
                        }
                    });

                    // 根据名称、别名回填数据
                    Object.keys(cmdConfig).forEach((item) => {
                        const { name, alias } = cmdConfig[item];
                        if (argvMap[name]) {
                            argv[name] = argvMap[name];
                        } else if (argvMap[alias]) {
                            argv[alias] = argvMap[alias];
                            argv[name] = argvMap[alias];
                        }
                    });
                } catch (e) {
                    console.error(`💀${chalk.red(e.message)}`);
                    process.exit();
                }

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
    const cmd = assembleCmd(argv);

    spinner.start();

    await new Auto(argv as any, spinner).run();

    saveHistory(cmd);

    spinner.stopAndPersist({
        text: `${cmdConfig.ora.success[language]}`,
        symbol: '🍺',
    });
} catch (e) {
    spinner.fail(chalk.redBright(`${cmdConfig.ora.fail[language]}: ${e.message}`));
}
