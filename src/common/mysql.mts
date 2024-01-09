import { file, hump } from './transitionTableName.mjs';
import { relationTableName, TableInfo, ColumnInfo, TableRelation, tableRelationMap } from './config.mjs';

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
                    table_schema = ? and table_name not in ('${relationTableName}')`;

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

    let isString = false;
    let isNumber = false;

    let javaDataType = dataType;
    let jsDataType = dataType;
    let sequelizeType = dataType.toLocaleUpperCase();

    if (columnType === 'tinyint(1)') {
        javaDataType = 'Boolean';
        jsDataType = 'boolean';
    } else if (dataType === 'varchar' || dataType === 'char' || dataType === 'text') {
        javaDataType = 'String';
        jsDataType = 'string';
        sequelizeType = 'STRING';
        isString = true;
    } else if (dataType === 'bigint') {
        javaDataType = 'Long';
        jsDataType = 'number';
        isNumber = true;
    } else if (
        dataType === 'integer' ||
        dataType === 'int' ||
        dataType === 'tinyint' ||
        dataType === 'smallint' ||
        dataType === 'bit'
    ) {
        javaDataType = 'Integer';
        jsDataType = 'number';
        isNumber = true;
    } else if (dataType === 'float') {
        javaDataType = 'Float';
        jsDataType = 'number';
        isNumber = true;
    } else if (dataType === 'double') {
        javaDataType = 'Double';
        jsDataType = 'number';
        isNumber = true;
    } else if (dataType === 'numeric' || dataType === 'bigDecimal' || dataType === 'decimal') {
        javaDataType = 'BigDecimal';
        jsDataType = 'number';
        isNumber = true;
    } else if (dataType === 'date') {
        javaDataType = 'Date';
        jsDataType = 'Date';
        sequelizeType = 'DATE';
    } else if (dataType === 'time') {
        javaDataType = 'Time';
        jsDataType = 'Date';
        sequelizeType = 'DATE';
    } else if (dataType === 'datetime') {
        javaDataType = 'Date';
        jsDataType = 'Date';
        sequelizeType = 'DATE';
    } else if (dataType === 'timestamp') {
        javaDataType = 'Timestamp';
        jsDataType = 'number';
    } else if (dataType === 'blob' || dataType === 'varbinary') {
        javaDataType = 'byte[]';
        jsDataType = 'byte';
    } else if (dataType === 'json') {
        javaDataType = 'List<String>';
        jsDataType = 'object';
    }

    return {
        javaDataType,
        jsDataType,
        sequelizeType,
        isString,
        isNumber,
    };
};

/**
 * 判断是否是mysql保留字
 * @param keyword
 * @returns boolean
 */
const isReservedWords = (keyword: string) => {
    const ReservedWords = [
        'ACCESSIBLE',
        'ACCOUNT',
        'ACTION',
        'ACTIVE',
        'ADD',
        'ADMIN',
        'AFTER',
        'AGAINST',
        'AGGREGATE',
        'ALGORITHM',
        'ALL',
        'ALTER',
        'ALWAYS',
        'ANALYZE',
        'AND',
        'ANY',
        'ARRAY',
        'AS',
        'ASC',
        'ASCII',
        'ASENSITIVE',
        'AT',
        'ATTRIBUTE',
        'AUTHENTICATION',
        'AUTOEXTEND_SIZE',
        'AUTO_INCREMENT',
        'AVG',
        'AVG_ROW_LENGTH',
        'BACKUP',
        'BEFORE',
        'BEGIN',
        'BETWEEN',
        'BIGINT',
        'BINARY',
        'BINLOG',
        'BIT',
        'BLOB',
        'BLOCK',
        'BOOL',
        'BOOLEAN',
        'BOTH',
        'BTREE',
        'BUCKETS',
        'BULK',
        'BY',
        'BYTE',
        'CACHE',
        'CALL',
        'CASCADE',
        'CASCADED',
        'CASE',
        'CATALOG_NAME',
        'CHAIN',
        'CHALLENGE_RESPONSE',
        'CHANGE',
        'CHANGED',
        'CHANNEL',
        'CHAR',
        'CHARACTER',
        'CHARSET',
        'CHECK',
        'CHECKSUM',
        'CIPHER',
        'CLASS_ORIGIN',
        'CLIENT',
        'CLONE',
        'CLOSE',
        'COALESCE',
        'CODE',
        'COLLATE',
        'COLLATION',
        'COLUMN',
        'COLUMNS',
        'COLUMN_FORMAT',
        'COLUMN_NAME',
        'COMMENT',
        'COMMIT',
        'COMMITTED',
        'COMPACT',
        'COMPLETION',
        'COMPONENT',
        'COMPRESSED',
        'COMPRESSION',
        'CONCURRENT',
        'CONDITION',
        'CONNECTION',
        'CONSISTENT',
        'CONSTRAINT',
        'CONSTRAINT_CATALOG',
        'CONSTRAINT_NAME',
        'CONSTRAINT_SCHEMA',
        'CONTAINS',
        'CONTEXT',
        'CONTINUE',
        'CONVERT',
        'CPU',
        'CREATE',
        'CROSS',
        'CUBE',
        'CUME_DIST',
        'CURRENT',
        'CURRENT_DATE',
        'CURRENT_TIME',
        'CURRENT_TIMESTAMP',
        'CURRENT_USER',
        'CURSOR',
        'CURSOR_NAME',
        'DATA',
        'DATABASE',
        'DATABASES',
        'DATAFILE',
        'DATE',
        'DATETIME',
        'DAY',
        'DAY_HOUR',
        'DAY_MICROSECOND',
        'DAY_MINUTE',
        'DAY_SECOND',
        'DEALLOCATE',
        'DEC',
        'DECIMAL',
        'DECLARE',
        'DEFAULT',
        'DEFAULT_AUTH',
        'DEFINER',
        'DEFINITION',
        'DELAYED',
        'DELAY_KEY_WRITE',
        'DELETE',
        'DENSE_RANK',
        'DESC',
        'DESCRIBE',
        'DESCRIPTION',
        'DETERMINISTIC',
        'DIAGNOSTICS',
        'DIRECTORY',
        'DISABLE',
        'DISCARD',
        'DISK',
        'DISTINCT',
        'DISTINCTROW',
        'DIV',
        'DO',
        'DOUBLE',
        'DROP',
        'DUAL',
        'DUMPFILE',
        'DUPLICATE',
        'DYNAMIC',
        'EACH',
        'ELSE',
        'ELSEIF',
        'EMPTY',
        'ENABLE',
        'ENCLOSED',
        'ENCRYPTION',
        'END',
        'ENDS',
        'ENFORCED',
        'ENGINE',
        'ENGINES',
        'ENGINE_ATTRIBUTE',
        'ENUM',
        'ERROR',
        'ERRORS',
        'ESCAPE',
        'ESCAPED',
        'EVENT',
        'EVENTS',
        'EVERY',
        'EXCEPT',
        'EXCHANGE',
        'EXCLUDE',
        'EXECUTE',
        'EXISTS',
        'EXIT',
        'EXPANSION',
        'EXPIRE',
        'EXPLAIN',
        'EXPORT',
        'EXTENDED',
        'EXTENT_SIZE',
        'FACTOR',
        'FAILED_LOGIN_ATTEMPTS',
        'FALSE',
        'FAST',
        'FAULTS',
        'FETCH',
        'FIELDS',
        'FILE',
        'FILE_BLOCK_SIZE',
        'FILTER',
        'FINISH',
        'FIRST',
        'FIRST_VALUE',
        'FIXED',
        'FLOAT',
        'FLOAT4',
        'FLOAT8',
        'FLUSH',
        'FOLLOWING',
        'FOLLOWS',
        'FOR',
        'FORCE',
        'FOREIGN',
        'FORMAT',
        'FOUND',
        'FROM',
        'FULL',
        'FULLTEXT',
        'FUNCTION',
        'GENERAL',
        'GENERATE',
        'GENERATED',
        'GEOMCOLLECTION',
        'GEOMETRY',
        'GEOMETRYCOLLECTION',
        'GET',
        'GET_FORMAT',
        'GET_MASTER_PUBLIC_KEY',
        'GET_SOURCE_PUBLIC_KEY',
        'GLOBAL',
        'GRANT',
        'GRANTS',
        'GROUP',
        'GROUPING',
        'GROUPS',
        'GROUP_REPLICATION',
        'GTID_ONLY',
        'HANDLER',
        'HASH',
        'HAVING',
        'HELP',
        'HIGH_PRIORITY',
        'HISTOGRAM',
        'HISTORY',
        'HOST',
        'HOSTS',
        'HOUR',
        'HOUR_MICROSECOND',
        'HOUR_MINUTE',
        'HOUR_SECOND',
        'IDENTIFIED',
        'IF',
        'IGNORE',
        'IGNORE_SERVER_IDS',
        'IMPORT',
        'IN',
        'INACTIVE',
        'INDEX',
        'INDEXES',
        'INFILE',
        'INITIAL',
        'INITIAL_SIZE',
        'INITIATE',
        'INNER',
        'INOUT',
        'INSENSITIVE',
        'INSERT',
        'INSERT_METHOD',
        'INSTALL',
        'INSTANCE',
        'INT',
        'INT1',
        'INT2',
        'INT3',
        'INT4',
        'INT8',
        'INTEGER',
        'INTERSECT',
        'INTERVAL',
        'INTO',
        'INVISIBLE',
        'INVOKER',
        'IO',
        'IO_AFTER_GTIDS',
        'IO_BEFORE_GTIDS',
        'IO_THREAD',
        'IPC',
        'IS',
        'ISOLATION',
        'ISSUER',
        'ITERATE',
        'JOIN',
        'JSON',
        'JSON_TABLE',
        'JSON_VALUE',
        'KEY',
        'KEYRING',
        'KEYS',
        'KEY_BLOCK_SIZE',
        'KILL',
        'LAG',
        'LANGUAGE',
        'LAST',
        'LAST_VALUE',
        'LATERAL',
        'LEAD',
        'LEADING',
        'LEAVE',
        'LEAVES',
        'LEFT',
        'LESS',
        'LEVEL',
        'LIKE',
        'LIMIT',
        'LINEAR',
        'LINES',
        'LINESTRING',
        'LIST',
        'LOAD',
        'LOCAL',
        'LOCALTIME',
        'LOCALTIMESTAMP',
        'LOCK',
        'LOCKED',
        'LOCKS',
        'LOGFILE',
        'LOGS',
        'LONG',
        'LONGBLOB',
        'LONGTEXT',
        'LOOP',
        'LOW_PRIORITY',
        'MASTER',
        'MASTER_AUTO_POSITION',
        'MASTER_BIND',
        'MASTER_COMPRESSION_ALGORITHMS',
        'MASTER_CONNECT_RETRY',
        'MASTER_DELAY',
        'MASTER_HEARTBEAT_PERIOD',
        'MASTER_HOST',
        'MASTER_LOG_FILE',
        'MASTER_LOG_POS',
        'MASTER_PASSWORD',
        'MASTER_PORT',
        'MASTER_PUBLIC_KEY_PATH',
        'MASTER_RETRY_COUNT',
        'MASTER_SSL',
        'MASTER_SSL_CA',
        'MASTER_SSL_CAPATH',
        'MASTER_SSL_CERT',
        'MASTER_SSL_CIPHER',
        'MASTER_SSL_CRL',
        'MASTER_SSL_CRLPATH',
        'MASTER_SSL_KEY',
        'MASTER_SSL_VERIFY_SERVER_CERT',
        'MASTER_TLS_CIPHERSUITES',
        'MASTER_TLS_VERSION',
        'MASTER_USER',
        'MASTER_ZSTD_COMPRESSION_LEVEL',
        'MATCH',
        'MAXVALUE',
        'MAX_CONNECTIONS_PER_HOUR',
        'MAX_QUERIES_PER_HOUR',
        'MAX_ROWS',
        'MAX_SIZE',
        'MAX_UPDATES_PER_HOUR',
        'MAX_USER_CONNECTIONS',
        'MEDIUM',
        'MEDIUMBLOB',
        'MEDIUMINT',
        'MEDIUMTEXT',
        'MEMBER',
        'MEMORY',
        'MERGE',
        'MESSAGE_TEXT',
        'MICROSECOND',
        'MIDDLEINT',
        'MIGRATE',
        'MINUTE',
        'MINUTE_MICROSECOND',
        'MINUTE_SECOND',
        'MIN_ROWS',
        'MOD',
        'MODE',
        'MODIFIES',
        'MODIFY',
        'MONTH',
        'MULTILINESTRING',
        'MULTIPOINT',
        'MULTIPOLYGON',
        'MUTEX',
        'MYSQL_ERRNO',
        'NAME',
        'NAMES',
        'NATIONAL',
        'NATURAL',
        'NCHAR',
        'NDB',
        'NDBCLUSTER',
        'NESTED',
        'NETWORK_NAMESPACE',
        'NEVER',
        'NEW',
        'NEXT',
        'NO',
        'NODEGROUP',
        'NONE',
        'NOT',
        'NOWAIT',
        'NO_WAIT',
        'NO_WRITE_TO_BINLOG',
        'NTH_VALUE',
        'NTILE',
        'NULL',
        'NULLS',
        'NUMBER',
        'NUMERIC',
        'NVARCHAR',
        'OF',
        'OFF',
        'OFFSET',
        'OJ',
        'OLD',
        'ON',
        'ONE',
        'ONLY',
        'OPEN',
        'OPTIMIZE',
        'OPTIMIZER_COSTS',
        'OPTION',
        'OPTIONAL',
        'OPTIONALLY',
        'OPTIONS',
        'OR',
        'ORDER',
        'ORDINALITY',
        'ORGANIZATION',
        'OTHERS',
        'OUT',
        'OUTER',
        'OUTFILE',
        'OVER',
        'OWNER',
        'PACK_KEYS',
        'PAGE',
        'PARSER',
        'PARTIAL',
        'PARTITION',
        'PARTITIONING',
        'PARTITIONS',
        'PASSWORD',
        'PASSWORD_LOCK_TIME',
        'PATH',
        'PERCENT_RANK',
        'PERSIST',
        'PERSIST_ONLY',
        'PHASE',
        'PLUGIN',
        'PLUGINS',
        'PLUGIN_DIR',
        'POINT',
        'POLYGON',
        'PORT',
        'PRECEDES',
        'PRECEDING',
        'PRECISION',
        'PREPARE',
        'PRESERVE',
        'PREV',
        'PRIMARY',
        'PRIVILEGES',
        'PRIVILEGE_CHECKS_USER',
        'PROCEDURE',
        'PROCESS',
        'PROCESSLIST',
        'PROFILE',
        'PROFILES',
        'PROXY',
        'PURGE',
        'QUARTER',
        'QUERY',
        'QUICK',
        'RANDOM',
        'RANGE',
        'RANK',
        'READ',
        'READS',
        'READ_ONLY',
        'READ_WRITE',
        'REAL',
        'REBUILD',
        'RECOVER',
        'RECURSIVE',
        'REDO_BUFFER_SIZE',
        'REDUNDANT',
        'REFERENCE',
        'REFERENCES',
        'REGEXP',
        'REGISTRATION',
        'RELAY',
        'RELAYLOG',
        'RELAY_LOG_FILE',
        'RELAY_LOG_POS',
        'RELAY_THREAD',
        'RELEASE',
        'RELOAD',
        'REMOTE',
        'REMOVE',
        'RENAME',
        'REORGANIZE',
        'REPAIR',
        'REPEAT',
        'REPEATABLE',
        'REPLACE',
        'REPLICA',
        'REPLICAS',
        'REPLICATE_DO_DB',
        'REPLICATE_DO_TABLE',
        'REPLICATE_IGNORE_DB',
        'REPLICATE_IGNORE_TABLE',
        'REPLICATE_REWRITE_DB',
        'REPLICATE_WILD_DO_TABLE',
        'REPLICATE_WILD_IGNORE_TABLE',
        'REPLICATION',
        'REQUIRE',
        'REQUIRE_ROW_FORMAT',
        'RESET',
        'RESIGNAL',
        'RESOURCE',
        'RESPECT',
        'RESTART',
        'RESTORE',
        'RESTRICT',
        'RESUME',
        'RETAIN',
        'RETURN',
        'RETURNED_SQLSTATE',
        'RETURNING',
        'RETURNS',
        'REUSE',
        'REVERSE',
        'REVOKE',
        'RIGHT',
        'RLIKE',
        'ROLE',
        'ROLLBACK',
        'ROLLUP',
        'ROTATE',
        'ROUTINE',
        'ROW',
        'ROWS',
        'ROW_COUNT',
        'ROW_FORMAT',
        'ROW_NUMBER',
        'RTREE',
        'SAVEPOINT',
        'SCHEDULE',
        'SCHEMA',
        'SCHEMAS',
        'SCHEMA_NAME',
        'SECOND',
        'SECONDARY',
        'SECONDARY_ENGINE',
        'SECONDARY_ENGINE_ATTRIBUTE',
        'SECONDARY_LOAD',
        'SECONDARY_UNLOAD',
        'SECOND_MICROSECOND',
        'SECURITY',
        'SELECT',
        'SENSITIVE',
        'SEPARATOR',
        'SERIAL',
        'SERIALIZABLE',
        'SERVER',
        'SESSION',
        'SET',
        'SHARE',
        'SHOW',
        'SHUTDOWN',
        'SIGNAL',
        'SIGNED',
        'SIMPLE',
        'SKIP',
        'SLAVE',
        'SLOW',
        'SMALLINT',
        'SNAPSHOT',
        'SOCKET',
        'SOME',
        'SONAME',
        'SOUNDS',
        'SOURCE',
        'SOURCE_AUTO_POSITION',
        'SOURCE_BIND',
        'SOURCE_COMPRESSION_ALGORITHMS',
        'SOURCE_CONNECT_RETRY',
        'SOURCE_DELAY',
        'SOURCE_HEARTBEAT_PERIOD',
        'SOURCE_HOST',
        'SOURCE_LOG_FILE',
        'SOURCE_LOG_POS',
        'SOURCE_PASSWORD',
        'SOURCE_PORT',
        'SOURCE_PUBLIC_KEY_PATH',
        'SOURCE_RETRY_COUNT',
        'SOURCE_SSL',
        'SOURCE_SSL_CA',
        'SOURCE_SSL_CAPATH',
        'SOURCE_SSL_CERT',
        'SOURCE_SSL_CIPHER',
        'SOURCE_SSL_CRL',
        'SOURCE_SSL_CRLPATH',
        'SOURCE_SSL_KEY',
        'SOURCE_SSL_VERIFY_SERVER_CERT',
        'SOURCE_TLS_CIPHERSUITES',
        'SOURCE_TLS_VERSION',
        'SOURCE_USER',
        'SOURCE_ZSTD_COMPRESSION_LEVEL',
        'SPATIAL',
        'SPECIFIC',
        'SQL',
        'SQLEXCEPTION',
        'SQLSTATE',
        'SQLWARNING',
        'SQL_AFTER_GTIDS',
        'SQL_AFTER_MTS_GAPS',
        'SQL_BEFORE_GTIDS',
        'SQL_BIG_RESULT',
        'SQL_BUFFER_RESULT',
        'SQL_CALC_FOUND_ROWS',
        'SQL_NO_CACHE',
        'SQL_SMALL_RESULT',
        'SQL_THREAD',
        'SQL_TSI_DAY',
        'SQL_TSI_HOUR',
        'SQL_TSI_MINUTE',
        'SQL_TSI_MONTH',
        'SQL_TSI_QUARTER',
        'SQL_TSI_SECOND',
        'SQL_TSI_WEEK',
        'SQL_TSI_YEAR',
        'SRID',
        'SSL',
        'STACKED',
        'START',
        'STARTING',
        'STARTS',
        'STATS_AUTO_RECALC',
        'STATS_PERSISTENT',
        'STATS_SAMPLE_PAGES',
        'STATUS',
        'STOP',
        'STORAGE',
        'STORED',
        'STRAIGHT_JOIN',
        'STREAM',
        'STRING',
        'SUBCLASS_ORIGIN',
        'SUBJECT',
        'SUBPARTITION',
        'SUBPARTITIONS',
        'SUPER',
        'SUSPEND',
        'SWAPS',
        'SWITCHES',
        'SYSTEM',
        'TABLE',
        'TABLES',
        'TABLESPACE',
        'TABLE_CHECKSUM',
        'TABLE_NAME',
        'TEMPORARY',
        'TEMPTABLE',
        'TERMINATED',
        'TEXT',
        'THAN',
        'THEN',
        'THREAD_PRIORITY',
        'TIES',
        'TIME',
        'TIMESTAMP',
        'TIMESTAMPADD',
        'TIMESTAMPDIFF',
        'TINYBLOB',
        'TINYINT',
        'TINYTEXT',
        'TLS',
        'TO',
        'TRAILING',
        'TRANSACTION',
        'TRIGGER',
        'TRIGGERS',
        'TRUE',
        'TRUNCATE',
        'TYPE',
        'TYPES',
        'UNBOUNDED',
        'UNCOMMITTED',
        'UNDEFINED',
        'UNDO',
        'UNDOFILE',
        'UNDO_BUFFER_SIZE',
        'UNICODE',
        'UNINSTALL',
        'UNION',
        'UNIQUE',
        'UNKNOWN',
        'UNLOCK',
        'UNREGISTER',
        'UNSIGNED',
        'UNTIL',
        'UPDATE',
        'UPGRADE',
        'URL',
        'USAGE',
        'USE',
        'USER',
        'USER_RESOURCES',
        'USE_FRM',
        'USING',
        'UTC_DATE',
        'UTC_TIME',
        'UTC_TIMESTAMP',
        'VALIDATION',
        'VALUE',
        'VALUES',
        'VARBINARY',
        'VARCHAR',
        'VARCHARACTER',
        'VARIABLES',
        'VARYING',
        'VCPU',
        'VIEW',
        'VIRTUAL',
        'VISIBLE',
        'WAIT',
        'WARNINGS',
        'WEEK',
        'WEIGHT_STRING',
        'WHEN',
        'WHERE',
        'WHILE',
        'WINDOW',
        'WITH',
        'WITHOUT',
        'WORK',
        'WRAPPER',
        'WRITE',
        'X509',
        'XA',
        'XID',
        'XML',
        'XOR',
        'YEAR',
        'YEAR_MONTH',
        'ZEROFILL',
        'ZONE',
    ];
    return ReservedWords.includes(keyword.toLocaleUpperCase());
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
            columnFileName: file(columnName),
            primaryKey: columnKey === 'PRI', // 主键
            autoIncrement: extra === 'auto_increment', // 自增
            dataType: dataType.toString().toUpperCase(),
            isNullable: isNullable === 'YES',
            isReservedWords: isReservedWords(columnName),
        };
    });
    return rows;
};

/**
 * 查询表映射关系
 */
const getTableRelation = async (connection: any, database: string) => {
    const tableRelationMap: tableRelationMap = {};
    const columns = {};
    const sql = `SELECT * FROM ${database}.${relationTableName}`;

    try {
        const result = await connection.query(sql);
        const rows: Array<TableRelation> = result[0];

        for (const item of rows) {
            const { table_a, table_a_key, table_b, table_b_key, relation, join = 'l' } = item;
            const tableAInfos = new Set(tableRelationMap[item.table_a] || []);
            const tableBInfos = new Set(tableRelationMap[item.table_b] || []);

            const tableAColumns = columns[table_a] || (await getTableColumn(connection, database, [table_a]));
            columns[table_a] = tableAColumns;

            const tableBColumns = columns[table_b] || (await getTableColumn(connection, database, [table_b]));
            columns[table_b] = tableBColumns;

            tableAInfos.add({
                table: table_b,
                tableFileName: file(table_b),
                tableHumpName: hump(table_b),
                mainKey: table_a_key,
                mainKeyFileName: file(table_a_key),
                relationKey: table_b_key,
                relationKeyFileName: file(table_b_key),
                relation,
                join,
                columns: tableBColumns,
            });

            tableBInfos.add({
                table: table_a,
                tableFileName: file(table_a),
                tableHumpName: hump(table_a),
                mainKey: table_b_key,
                mainKeyFileName: file(table_b_key),
                relationKey: table_a_key,
                relationKeyFileName: file(table_a_key),
                relation: relation.split('').reverse().join('') as any,
                join,
                columns: tableAColumns,
            });

            tableRelationMap[item.table_a] = Array.from(tableAInfos);
            tableRelationMap[item.table_b] = Array.from(tableBInfos);
        }
    } catch (e) {}

    return tableRelationMap;
};

export { getAllTables, getTableComment, getTableColumn, getTableRelation };
