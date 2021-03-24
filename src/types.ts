/**
 * 初始化扩展参数
 */
export interface Options {
    /** 数据库用户名 */
    user?: string;

    /** 数据库端口 */
    port?: number;

    /** 生产表名 */
    tableName?: string;

    /** 内置模板名 */
    template?: templateType;

    /** 自定义模板路径 */
    templateConfigPath?: string;

    /** 自定义参数，格式key1=value&key2=value */
    params?: string;

    /** 参数json文件路径 */
    paramsFilePath?: string;

    /** 保存文件路径 */
    saveFileRootPath?: string;
}

/**
 * 内部传参
 */
export interface Config extends Options {
    /** 数据库地址 */
    host: string;

    /** 数据库名 */
    database: string;

    /** 数据库登录密码 */
    password: string;

    /** 要生成的表名 */
    tableNames?: Array<string>;

    /** 文件扩展名 */
    fileExtension?: string;

    /** 自定义参数 */
    customParams?: any;
}

/**
 * 表信息
 */
export interface TableInfo {
    /** 表明 */
    tableName: string;

    /** 备注 */
    tableComment: string;
}

/**
 * 列信息
 */
export interface ColumnInfo {
    /** 列名 */
    columnName: string;

    /** 列名 驼峰格式 */
    columnHumpName: string;

    /** 是否允许为空 */
    isNullable: boolean;

    /** 数据类型 */
    dataType: string;

    /** 最大长度 */
    characterMaximumLength: number;

    /** 是否主键 */
    columnKey: string;

    /** 是否主键 */
    extra: string;

    /** 备注 */
    columnComment: string;

    /** 表明 */
    tableName: string;

    /** 列类型 */
    columnType: string;
}

/**
 * 内置模板
 */
export enum templateType {
    'default' = 'default',
    'myself' = 'myself',
}

/**
 * 模板配置
 */
export interface templateConfig {
    /** 文件名 */
    name: string;

    /** 模板文件 */
    templateFile: string;

    /** 保存目录 */
    saveFilePath?: string;

    /** 保存文件扩展名 */
    fileExtension?: string;
}

/**
 * 模板参数
 */
export interface templateParmas {
    /** 数据库表名 */
    tableName: string;

    /** 数据库表名对应文件名 */
    tableFileName: string;

    /** 数据库表名对应驼峰名 */
    tableHumpName: string;

    /** 数据库表备注 */
    tableComment: string;

    /** 数据库表列信息 */
    columns: Array<ColumnInfo>;
}
