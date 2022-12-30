import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import * as mysql from 'mysql2';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import moment from 'moment';
import { fileURLToPath } from 'url';
import { hump, file } from './common/transitionTableName.js';
import { config as templatePighandSpring } from './template/config/pighand-spring.js';
import { getTableComment, getTableColumn, getAllTables } from './common/mysql.js';
import {
    Options,
    Config,
    TableInfo,
    ColumnInfo,
    templateParams,
    templateType,
    templateConfig,
} from './common/config.js';

class Auto {
    config: Config;
    spinner: Ora;

    constructor(options: Options, spinner: Ora) {
        this.spinner = spinner;

        const { tableName, params, paramsPath, saveFileRootPath } = options;

        // 过滤空表名
        const tableNamesFormat =
            (tableName && Array.from(new Set(tableName.split(' ').filter((item) => !!item.trim())))) || [];

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
            const columns = tableColumnMap.get(table.tableName);

            // 文件名
            const tableFileName = file(tableName);

            // 驼峰名
            const tableHumpName = hump(tableName);
            const params: templateParams = {
                ...customParams,
                tableName,
                tableFileName,
                tableHumpName,
                tableComment,
                columns,
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
            }
        }

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        templateConfig.forEach((item) => {
            const { name, templateFile, saveFilePath = name, fileExtension } = item;

            // 使用模板生成文件
            const templateFilePath =
                templatePathType === 'internal' ? path.resolve(__dirname, templateFile) : templateFile;
            const templateFileString = fs.readFileSync(templateFilePath).toString();
            const newFileString = ejs.render(templateFileString, params);

            // 生产文件
            // 路径：filePath（不存在默认使用name）/文件名 + 扩展名
            const filePath = path.join(saveFileRootPath || __dirname, saveFilePath);
            const fileName = `${params.tableFileName}${file(name)}.${fileExtension}`;

            const isExist = fs.existsSync(filePath);
            if (!isExist) {
                fs.mkdirSync(filePath, { recursive: true });
            }

            const saveFile = path.join(filePath, fileName);
            fs.writeFileSync(saveFile, newFileString);

            ora(chalk.green(path.resolve(saveFile))).succeed();
        });
    }
}

export default Auto;
