import { templateConfig } from '../../types';

const config: Array<templateConfig> = [
    {
        name: 'model',
        templateFile: 'template/ejs/default/model.ejs',
        saveFilePath: 'model',
    },
    {
        name: 'service',
        templateFile: 'template/ejs/default/service.ejs',
        saveFilePath: 'service',
    },
    {
        name: 'controller',
        templateFile: 'template/ejs/default/controller.ejs',
        saveFilePath: 'controller',
    },
    {
        name: 'router',
        templateFile: 'template/ejs/default/router.ejs',
        saveFilePath: 'router',
    },
    {
        name: 'api',
        templateFile: 'template/ejs/default/api.ejs',
        fileExtension: 'json',
    },
];

export { config };
