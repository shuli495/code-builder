import { templateConfig } from '../../common/config.mjs';

const config: Array<templateConfig> = [
    {
        name: 'api',
        templateFile: 'template/ejs/pighand-dashboard-vue/api.ejs',
        saveFilePath: 'api',
        fileExtension: 'ts',
    },
    {
        name: 'pages',
        templateFile: 'template/ejs/pighand-dashboard-vue/pages.ejs',
        saveFilePath: 'pages',
        fileExtension: 'vue',
    },
];

export { config };
