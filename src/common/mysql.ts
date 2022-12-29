import { hump } from './transitionTableName.js';
import { TableInfo, ColumnInfo } from './config.js';

/**
 * 查询所有表
 * @param {connection} connection mysql链接
 * @param {string} database 库
 * @returns {Array<TableInfo>} 所有表信息：表明、注释
 */
const getAllTables = async (connection: any, database: string) => {
    const sql = `SELECT
                    table_name as tableName, table_comment as tableComment
                FROM
                    information_schema.tables
                WHERE
                    table_schema = ?`;

    const result = await connection.query(sql, [database]);
    const rows: Array<TableInfo> = result[0];
    return rows;
};

/**
 * 查询表注释
 * @param {connection} connection mysql链接
 * @param {string} database 库
 * @param {array<string>} tableNames 表明
 * @returns {string} 表注释
 */
const getTableComment = async (connection: any, database: string, tableNames: Array<string>) => {
    const sql = `SELECT
                    table_name as tableName,
                    table_comment as tableComment
                FROM
                    information_schema.TABLES
                WHERE
                    table_schema = ? AND table_name in (?)`;

    const result = await connection.query(sql, [database, tableNames]);
    const rows: Array<TableInfo> = result[0];

    return rows;
};

/**
 * 转换数据类型
 * @param columnType 列类型，包含长度
 * @param dataType  数据类型
 * @returns
 */
const getDataType = (columnType: string, dataType: string) => {
    columnType = columnType.toLocaleLowerCase();
    dataType = dataType.toLocaleLowerCase();

    let javaDataType = dataType;
    if (columnType === 'tinyint(1)') {
        javaDataType = 'Boolean';
    } else if (dataType === 'varchar' || dataType === 'char' || dataType === 'text') {
        javaDataType = 'String';
    } else if (dataType === 'varchar' || dataType === 'char' || dataType === 'text') {
        javaDataType = 'String';
    } else if (dataType === 'bigint') {
        javaDataType = 'Long';
    } else if (
        dataType === 'integer' ||
        dataType === 'int' ||
        dataType === 'tinyint' ||
        dataType === 'smallint' ||
        dataType === 'bit'
    ) {
        javaDataType = 'Integer';
    } else if (dataType === 'float') {
        javaDataType = 'Float';
    } else if (dataType === 'double') {
        javaDataType = 'Double';
    } else if (dataType === 'numeric' || dataType === 'bigDecimal') {
        javaDataType = 'BigDecimal';
    } else if (dataType === 'tate') {
        javaDataType = 'Date';
    } else if (dataType === 'time') {
        javaDataType = 'Time';
    } else if (dataType === 'timestamp') {
        javaDataType = 'Timestamp';
    } else if (dataType === 'blob' || dataType === 'varbinary') {
        javaDataType = 'byte[]';
    } else if (dataType === 'json') {
        javaDataType = 'JSON';
    }

    return {
        javaDataType,
    };
};

/**
 * 查询列
 * @param {connection} connection mysql链接
 * @param {string} database 库
 * @param {string} tableName 表明
 * @returns {Array<ColumnInfo>} 列信息
 */
const getTableColumn = async (connection: any, database: string, tableNames: Array<string>) => {
    const sql = `SELECT
                    column_name as columnName, is_nullable as isNullable, data_type as dataType,
                    character_maximum_length as characterMaximumLength, column_key as columnKey,
                    extra as extra, column_comment as columnComment, table_name as tableName,
                    column_type as columnType
                FROM
                    information_schema.COLUMNS
                WHERE
                    table_schema = ? AND table_name in (?)
                ORDER BY ORDINAL_POSITION`;

    const result = await connection.query(sql, [database, tableNames]);

    const rows: Array<ColumnInfo> = result[0].map((item: any) => {
        const { columnType, dataType, columnName, columnKey, extra, isNullable } = item;
        const languageDataType = getDataType(columnType, dataType);

        return {
            ...item,
            ...languageDataType,
            columnHumpName: hump(columnName),
            primaryKey: columnKey === 'PRI', // 主键
            autoIncrement: extra === 'auto_increment', // 自增
            dataType: dataType.toString().toUpperCase(),
            isNullable: isNullable === 'YES',
        };
    });
    return rows;
};

export { getAllTables, getTableComment, getTableColumn };
