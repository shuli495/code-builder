import { templateConfig } from '../../types';

const config: Array<templateConfig> = [
    {
        name: 'model',
        templateFile: 'template/ejs/myself/model.ejs',
        saveFilePath: 'model',
    },
    {
        name: 'service',
        templateFile: 'template/ejs/myself/service.ejs',
        saveFilePath: 'service',
    },
    {
        name: 'controller',
        templateFile: 'template/ejs/myself/controller.ejs',
        saveFilePath: 'controller',
    },
    {
        name: 'router',
        templateFile: 'template/ejs/myself/router.ejs',
        saveFilePath: 'router',
    },
    {
        name: 'api',
        templateFile: 'template/ejs/myself/api.ejs',
        fileExtension: 'json',
    },
];

export { config };
