import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import * as mysql from 'mysql2';
import chalk from 'chalk';
import moment from 'moment';
import ora, { Ora } from 'ora';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { hump, file } from './common/transitionTableName.mjs';
import { config as templatePighandSpring } from './template/config/pighand-spring.mjs';
import { config as templatePighandKoa } from './template/config/pighand-koa.mjs';
import { getTableComment, getTableColumn, getAllTables } from './common/mysql.mjs';
import {
    Options,
    Config,
    TableInfo,
    ColumnInfo,
    templateParams,
    templateType,
    templateConfig,
    inquirerConflict,
} from './common/config.mjs';

class Auto {
    config: Config;
    spinner: Ora;

    constructor(options: Options, spinner: Ora) {
        this.spinner = spinner;

        const { tableName, params, paramsPath, saveFileRootPath } = options;

        // 过滤空表名
        const tableNamesFormat = (tableName && Array.from(new Set(tableName.filter((item) => !!item.trim())))) || [];

        // 根据java关键字，处理默认java package
        const paths = path.resolve(saveFileRootPath).split(path.sep);
        const javaPathIndex = paths.indexOf('java') + 1;
        const javaPackage = paths.slice(javaPathIndex).join('.');

        // 处理自定义参数
        let customParams: any = {
            javaPackage,
            dateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            author: process.env.USER,
        };

        // 自定义参数
        (params || '').split('&').forEach((item) => {
            const paramsItems = item.split('=');
            if (paramsItems.length >= 2) {
                const [paramsItemFirst, ...paramsItemsOther] = paramsItems;
                customParams[paramsItemFirst] = paramsItemsOther.join('=');
            }
        });

        // 自定义参数文件
        if (paramsPath) {
            const paramsFile = fs.readFileSync(paramsPath).toString();
            const paramsFileJson = JSON.parse(paramsFile);

            customParams = {
                ...customParams,
                ...paramsFileJson,
            };
        }

        this.config = {
            ...options,
            tableNames: tableNamesFormat,
            customParams,
        };
    }

    async run() {
        const { customParams } = this.config;
        const { tables, tableColumnMap } = await this.getTableInfos();

        for (const table of tables) {
            const { tableName, tableComment } = table;

            const params: templateParams = {
                ...customParams,
                tableName,
                tableComment,
                tableFileName: file(tableName), // 文件名，开头字母大写
                tableHumpName: hump(tableName), // 驼峰名
                columns: tableColumnMap.get(table.tableName),
            };

            this.spinner.text = chalk.blue(tableName);

            // 生成文件
            await this.generateFile(params);
        }
    }

    /**
     * 获取表信息
     * @returns {Array<TableInfo>} tables 表备注信息
     * @returns {Map{表名: ColumnInfo}} tableColumnMap 表列信息
     */
    private async getTableInfos() {
        let tables: Array<TableInfo> = [];
        let tableColumns: Array<ColumnInfo> = [];

        const { host, port, user, password, database, tableNames } = this.config;

        // 连接数据库
        const pool = mysql.createConnection({
            host,
            port,
            user,
            password,
            database,
        });

        const connection = pool.promise();

        // 查询表信息
        if (tableNames && tableNames.length) {
            // 指定表明
            tables = await getTableComment(connection, database, tableNames);
            tableColumns = await getTableColumn(connection, database, tableNames);
        } else {
            // 全部表
            tables = await getAllTables(connection, database);
            const allTableNames: Array<string> = tables.map((item) => item.tableName);

            tableColumns = await getTableColumn(connection, database, allTableNames);
        }

        await connection.end();

        // 根据表明格式化列
        // {表名: ColumnInfo}
        const tableColumnMap = new Map<string, Array<ColumnInfo>>();
        tableColumns.forEach((item) => {
            const { tableName } = item;
            const columnInfos: Array<ColumnInfo> = tableColumnMap.get(tableName) || [];
            columnInfos.push(item);

            tableColumnMap.set(tableName, columnInfos);
        });

        return {
            tables,
            tableColumnMap,
        };
    }

    /**
     * 生成文件
     * @param params
     */
    private async generateFile(params: templateParams) {
        const { template, templatePath, saveFileRootPath } = this.config;

        // 模板类型
        // customize 自定义，使用绝对路径查找配置文件
        // internal 内置，使用相对路径查找配置文件
        let templatePathType = 'customize';

        // 读取模板配置
        let templateConfig: Array<templateConfig> = [];
        if (templatePath) {
            // 根据配置文件路径读取模板配置
            const templateConfigFileBuffer = fs.readFileSync(templatePath);
            templateConfig = JSON.parse(templateConfigFileBuffer.toString());
        } else {
            // 使用内置模板
            templatePathType = 'internal';

            switch (template) {
                case templateType.pighandSpring:
                    templateConfig = templatePighandSpring;
                    break;
                case templateType.pighandKoa:
                    templateConfig = templatePighandKoa;
                    break;
            }
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // 是否批量操作
        let isBatch = false;

        for (const item of templateConfig) {
            const { name, templateFile, saveFilePath = name, fileExtension } = item;

            // 使用模板生成文件
            const templateFilePath =
                templatePathType === 'internal' ? path.resolve(__dirname, templateFile) : templateFile;
            const templateFileString = fs.readFileSync(templateFilePath).toString();
            const newFileString = ejs.render(templateFileString, params);

            // 路径：filePath（不存在默认使用name）/文件名 + 扩展名
            const filePath = path.join(saveFileRootPath || __dirname, saveFilePath);
            const fileName = `${params.tableFileName}${file(name)}.${fileExtension}`;

            // 目录是否存在
            const isPathExist = fs.existsSync(filePath);
            if (!isPathExist) {
                fs.mkdirSync(filePath, { recursive: true });
            }

            const saveFile = path.join(filePath, fileName);
            const isFileExist = fs.existsSync(saveFile);

            // 如果文件存在，且未执行批量操作，提示用户选择操作方式
            if (isFileExist && !isBatch) {
                // 显示冲突文件
                this.spinner.warn(chalk.yellow(saveFile));

                // 输入参数不正确，重新提示选择
                let conflict;
                while (!conflict) {
                    const prompt = inquirer.createPromptModule();
                    const op = await prompt(inquirerConflict);

                    if (inquirerConflict[0].choices.includes(op.conflict)) {
                        conflict = op.conflict;
                    }
                }

                if (conflict === 'n') {
                    continue;
                } else if (conflict === 'N') {
                    break;
                } else if (conflict === 'R') {
                    isBatch = true;
                }
            }

            fs.writeFileSync(saveFile, newFileString);

            ora(chalk.green(path.resolve(saveFile))).succeed();
        }
    }
}

export default Auto;
