import { templateConfig } from '../../common/config.mjs';

const config: Array<templateConfig> = [
    {
        name: 'model',
        templateFile: 'template/ejs/pighand-koa/model.ejs',
        saveFilePath: 'model',
        fileExtension: 'ts',
    },
    {
        name: 'service',
        templateFile: 'template/ejs/pighand-koa/service.ejs',
        saveFilePath: 'service',
        fileExtension: 'ts',
    },
    {
        name: 'controller',
        templateFile: 'template/ejs/pighand-koa/controller.ejs',
        saveFilePath: 'controller',
        fileExtension: 'ts',
    },
];

export { config };
