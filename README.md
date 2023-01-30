# code-file-builder

根据数据库表和模板，自动生成代码。

<img src="https://github.com/shuli495/code-file-builder/blob/main/screenshot.png?raw=true">

## 快速开始

1. 安装

```
npm install -g code-file-builder
```

2. 生成

```
// 使用命令行生成
code-file-builder -t mysql -h 127.0.0.1 -p 3306 -u root -x 12345678 -d testDb -m pighand-spring -r .

// 按步骤提示生成
code-file-builder guide
```

## 其他参数

| 参数名           | 别名 | 默认值           | 前置条件            | 说明                                                                      |
| ---------------- | ---- | ---------------- | ------------------- | ------------------------------------------------------------------------- |
| type             | t    | mysql            |                     | 操作类型。可选值'mysql'、'mongo'                                          |
| host             | h    | 127.0.0.1        | type=mysql \| mongo | 数据库地址                                                                |
| port             | p    | 3306 \| 27017    | type=mysql \| mongo | 数据库端口。默认值根据 type 自动识别                                      |
| user             | u    | root             | type=mysql \| mongo | 数据库用户名                                                              |
| password         | x    |                  | type=mysql \| mongo | 数据库密码                                                                |
| database         | d    |                  | type=mysql \| mongo | 数据库名                                                                  |
| tableName        |      |                  | type=mysql \| mongo | 表名。多个表用”空格“分开，不填生成所有表                                  |
| template         | m    |                  |                     | 内置模板，与 templatePath 必填一个。可选值'pighand-spring'、'pighand-koa' |
| templatePath     |      |                  |                     | 自定义模板，填写模路径。与 template 必填一个， 同时存在 templatePath 优先 |
| params           | n    |                  |                     | 自定义模板参数。例：key1=value&key2=value                                 |
| paramsPath       |      |                  |                     | 自定义参数文件路径。文件是 json 格式。可与 params 同时存在                |
| saveFileRootPath | r    | 当前执行命令目录 |                     | 保存文件路径                                                              |

## 自定义模板

### 1. 配置文件

```
[
    {
        // 文件名后缀
        name: 'model',

        // 模板文件绝对路径，模板具体使用方式查看[ejs](https://github.com/mde/ejs)
        templateFile: 'model.ejs',

        // 保存文件目录，不填默认取name的值
        saveFilePath: 'model',

        // 文件扩展名
        fileExtension: 'js',
    }
]

# 生成结果：${saveFileRootPath}/model/tableNameModel.js
```

### 2. 模板文件

基于 [ejs](https://github.com/mde/ejs) 生成

内置参数（可直接在 ejs 模板中使用）：

| 参数                           | 数据类型 | 可用 params、paramsPath 替换 | 说明                                                  |
| ------------------------------ | -------- | ---------------------------- | ----------------------------------------------------- |
| dateTime                       | string   | Y                            | 当前时间，格式：YYYY-MM-DD HH:mm:ss                   |
| author                         | string   | Y                            | 作者信息，默认系统用户名                              |
| javaPackage                    | string   | Y                            | java 项目 package 路径，默认根据生成路径识别          |
| tableName                      | string   | N                            | 数据库表名                                            |
| tableFileName                  | string   | N                            | 表名对应的文件名，即首字母大写的表名                  |
| tableHumpName                  | string   | N                            | 驼峰格式的表名                                        |
| tableComment                   | string   | N                            | 表备注                                                |
| columns                        | array    | N                            | 列信息                                                |
| columns.columnName             | string   | N                            | 列名                                                  |
| columns.columnHumpName         | string   | N                            | 驼峰格式列名                                          |
| columns.dataType               | string   | N                            | 数据类型，与 mysql 数据类型一致，INTEGER、VARCHAR 等  |
| columns.javaDataType           | string   | N                            | java 数据类型,String、Long、BigDecimal、Date、JSON 等 |
| columns.isString               | boolean  | N                            | 是否是字符串                                          |
| columns.isNumber               | boolean  | N                            | 是否是数字                                            |
| columns.columnType             | string   | N                            | 列完整类型，varchar(32)等                             |
| columns.characterMaximumLength | number   | N                            | 最大长度                                              |
| columns.isNullable             | boolean  | N                            | 是否允许 null                                         |
| columns.primaryKey             | boolean  | N                            | 是否是主键                                            |
| columns.autoIncrement          | boolean  | N                            | 是否自增                                              |
| columns.columnComment          | string   | N                            | 列备注                                                |
| columns.isReservedWords        | boolean  | N                            | 是否是 mysql 保留字                                   |

<br/>
如需其他参数，可使用--params、--paramsPath添加自定义参数
