# code-file-builder

根据数据库表和模板，自动生成代码。

## 简单运行

```
// 全局安装
npm install -g code-file-builder

// 生成db库中所有表的代码
code-file-builder -h 127.0.0.1 -x pwd -d db
```

## 其他参数

-u, --user

> 数据库用户名，默认：root

-p, --port

> 数据库端口，默认：3306

-t, --tableName

> 生成代码的表名，多个表用英文逗号分隔。

-m, --template

> 内置模板，用于生成文件。default/ydn

-c, --templateConfigPath

> 用户自定义模板路径。

-n, --params

> 自定义参数。格式：key1=value&key2=value

-s, --paramsFilePath

> 自定义参数文件路径。文件内容格式：json

-r, --saveFileRootPath

> 生成文件保存目录。默认执行命令行所在目录。

## 自定义模板

### 1. 配置文件

```
[
    {
        // 文件名后缀
        name: 'model',

        // 模板文件绝对路径
        templateFile: 'model.ejs',

        // 保存文件目录，不填默认取name的值
        saveFilePath: 'model',

        // 文件扩展名，不填默认js
        fileExtension: 'js',
    }
]

# 生成结果：model/tableNameModel.js
```

### 2. 模板文件

基于 ejs 生成：https://github.com/mde/ejs

内置参数（可直接在 ejs 模板中使用）：

| 参数                           | 数据类型 | 说明                                                 |
| ------------------------------ | -------- | ---------------------------------------------------- |
| tableName                      | string   | 数据库表名                                           |
| tableFileName                  | string   | 表名对应的文件名，即首字母大写的表名                 |
| tableHumpName                  | string   | 驼峰格式的表名                                       |
| tableComment                   | string   | 表备注                                               |
| columns                        | array    | 列信息                                               |
| columns.columnName             | string   | 列名                                                 |
| columns.columnHumpName         | string   | 驼峰格式列名                                         |
| columns.dataType               | string   | 数据类型，与 mysql 数据类型一致，INTEGER、VARCHAR 等 |
| columns.columnType             | string   | 列完整类型，varchar(32)等                            |
| columns.characterMaximumLength | number   | 最大长度                                             |
| columns.isNullable             | boolean  | 是否允许 null                                        |
| columns.primaryKey             | boolean  | 是否是主键                                           |
| columns.autoIncrement          | boolean  | 是否自增                                             |
| columns.columnComment          | string   | 列备注                                               |

<br/>
如需其他参数，可使用--params、--paramsFilePath添加自定义参数
