"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const mysql = require("mysql2");
const defaultValue_1 = require("./defaultValue");
const reTableName_1 = require("./reTableName");
const default_1 = require("./template/config/default");
const myself_1 = require("./template/config/myself");
const mysql_1 = require("./mysql");
const types_1 = require("./types");
class Auto {
    constructor(host, password, database, options) {
        const { port = defaultValue_1.default.dbPort, user = defaultValue_1.default.dbUser, tableName, template, templateConfigPath, params, paramsFilePath, saveFileRootPath, } = options;
        const tableNamesFormat = (tableName && Array.from(new Set(tableName.split(',').map((item) => item.trim())))) || [];
        // 处理自定义参数
        let customParams = {};
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
            customParams = Object.assign(Object.assign({}, customParams), paramsFileJson);
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
            const tableFileName = reTableName_1.file(tableName);
            // 驼峰名
            const tableHumpName = reTableName_1.hump(tableName);
            const parmas = Object.assign(Object.assign({}, customParams), { tableName,
                tableFileName,
                tableHumpName,
                tableComment,
                columns });
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
        let tables = [];
        let tableColumns = [];
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
            tables = await mysql_1.getTableComment(connection, database, tableNames);
            tableColumns = await mysql_1.getTableColumn(connection, database, tableNames);
        }
        else {
            // 全部表
            tables = await mysql_1.getAllTables(connection, database);
            const allTableNames = tables.map((item) => item.tableName);
            tableColumns = await mysql_1.getTableColumn(connection, database, allTableNames);
        }
        // 根据表明格式化列
        // {表名: ColumnInfo}
        const tableColumnMap = new Map();
        tableColumns.forEach((item) => {
            const { tableName } = item;
            const columnInfos = tableColumnMap.get(tableName) || [];
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
    async generateFile(parmas) {
        const { template, templateConfigPath, saveFileRootPath } = this.config;
        // 模板类型
        // customize 自定义，使用绝对路径查找配置文件
        // internal 内置，使用相对路径查找配置文件
        let templatePathType = 'customize';
        // 读取模板配置
        let templateConfig = [];
        if (template || !templateConfigPath) {
            templatePathType = 'internal';
            // 使用内置模板
            switch (template) {
                case types_1.templateType.default:
                    templateConfig = default_1.config;
                    break;
                case types_1.templateType.myself:
                    templateConfig = myself_1.config;
                    break;
                default:
                    templateConfig = default_1.config;
                    break;
            }
        }
        else {
            // 根据配置文件路径读取模板配置
            const templateConfigFileBuffer = fs.readFileSync(templateConfigPath);
            templateConfig = JSON.parse(templateConfigFileBuffer.toString());
        }
        templateConfig.forEach((item) => {
            const { name, templateFile, saveFilePath = name, fileExtension = defaultValue_1.default.fileExtension } = item;
            // 使用模板生成文件
            const templateFilePath = templatePathType === 'internal' ? path.resolve(__dirname, templateFile) : templateFile;
            const tmplateFileString = fs.readFileSync(templateFilePath).toString();
            const newFileString = ejs.render(tmplateFileString, parmas);
            // 生产文件
            // 路径：filePath（不存在默认使用name）/文件名 + 扩展名
            const filePath = path.join(saveFileRootPath || __dirname, 'codeFiles', saveFilePath);
            const fileName = `${parmas.tableFileName}${reTableName_1.file(name)}.${fileExtension}`;
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
exports.default = Auto;
//# sourceMappingURL=auto.js.map