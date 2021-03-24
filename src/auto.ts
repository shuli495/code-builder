import * as fs from 'fs';
import * as ejs from 'ejs';
import * as path from 'path';
import * as mysql from 'mysql2';
import defaultValue from './defaultValue';
import { hump, file } from './reTableName';
import { config as templateDefault } from './template/config/default';
import { config as templateMyself } from './template/config/myself';
import { getTableComment, getTableColumn, getAllTables } from './mysql';
import { Options, Config, TableInfo, ColumnInfo, templateParmas, templateType, templateConfig } from './types';

class Auto {
    config: Config;

    constructor(host: string, password: string, database: string, options?: Options) {
        const {
            port = defaultValue.dbPort,
            user = defaultValue.dbUser,
            tableName,
            template,
            templateConfigPath,
            params,
            paramsFilePath,
            saveFileRootPath,
        } = options;

        const tableNamesFormat =
            (tableName && Array.from(new Set(tableName.split(',').map((item) => item.trim())))) || [];

        // 处理自定义参数
        let customParams: any = {};
        // 自定义参数
        (params || '').split('&').forEach((item) => {
            const paramsItems = item.split('=');
            if (paramsItems.length >= 2) {
                const [paramsItemFirst, ...paramsItemsOther] = paramsItems;
                customParams[paramsItemFirst] = paramsItemsOther.join('=');
            }
        });
        // 自定义参数文件
        if (paramsFilePath) {
            const paramsFile = fs.readFileSync(paramsFilePath).toString();
            const paramsFileJson = JSON.parse(paramsFile);

            customParams = {
                ...customParams,
                ...paramsFileJson,
            };
        }

        this.config = {
            host,
            port,
            database,
            user,
            password,
            tableNames: tableNamesFormat,
            template,
            templateConfigPath,
            customParams,
            saveFileRootPath,
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

            const parmas: templateParmas = {
                ...customParams,
                tableName,
                tableFileName,
                tableHumpName,
                tableComment,
                columns,
            };

            console.info(`begin ${tableName}:`);

            // 生成文件
            await this.generateFile(parmas);
        }

        console.info('finish');
    }

    /**
     * 获取表信息
     * @returns {Array<TableInfo>} tables 表备注信息
     * @returns {Map{表名: ColumnInfo}} tableColumnMap 表列信息
     */
    async getTableInfos() {
        let tables: Array<TableInfo> = [];
        let tableColumns: Array<ColumnInfo> = [];

        const { host, port, user, password, database, tableNames } = this.config;

        // 连接数据库
        const pool = await mysql.createConnection({
            host,
            port,
            user,
            password,
            database,
        });
        const connection = pool.promise();

        // 查询表信息
        if (tableNames.length) {
            // 指定表明
            tables = await getTableComment(connection, database, tableNames);
            tableColumns = await getTableColumn(connection, database, tableNames);
        } else {
            // 全部表
            tables = await getAllTables(connection, database);
            const allTableNames: Array<string> = tables.map((item) => item.tableName);

            tableColumns = await getTableColumn(connection, database, allTableNames);
        }

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
     * @param parmas
     */
    async generateFile(parmas: templateParmas) {
        const { template, templateConfigPath, saveFileRootPath } = this.config;

        // 模板类型
        // customize 自定义，使用绝对路径查找配置文件
        // internal 内置，使用相对路径查找配置文件
        let templatePathType = 'customize';

        // 读取模板配置
        let templateConfig: Array<templateConfig> = [];
        if (template || !templateConfigPath) {
            templatePathType = 'internal';

            // 使用内置模板
            switch (template) {
                case templateType.default:
                    templateConfig = templateDefault;
                    break;
                case templateType.myself:
                    templateConfig = templateMyself;
                    break;
                default:
                    templateConfig = templateDefault;
                    break;
            }
        } else {
            // 根据配置文件路径读取模板配置
            const templateConfigFileBuffer = fs.readFileSync(templateConfigPath);
            templateConfig = JSON.parse(templateConfigFileBuffer.toString());
        }

        templateConfig.forEach((item) => {
            const { name, templateFile, saveFilePath = name, fileExtension = defaultValue.fileExtension } = item;

            // 使用模板生成文件
            const templateFilePath =
                templatePathType === 'internal' ? path.resolve(__dirname, templateFile) : templateFile;
            const tmplateFileString = fs.readFileSync(templateFilePath).toString();
            const newFileString = ejs.render(tmplateFileString, parmas);

            // 生产文件
            // 路径：filePath（不存在默认使用name）/文件名 + 扩展名
            const filePath = path.join(saveFileRootPath || __dirname, 'codeFiles', saveFilePath);
            const fileName = `${parmas.tableFileName}${file(name)}.${fileExtension}`;

            const isExist = fs.existsSync(filePath);
            if (!isExist) {
                fs.mkdirSync(filePath, { recursive: true });
            }

            const saveFile = path.join(filePath, fileName);
            fs.writeFileSync(saveFile, newFileString);

            console.info(saveFile);
        });
    }
}

export default Auto;
