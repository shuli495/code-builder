import { templateConfig } from '../../common/config.js';

const config: Array<templateConfig> = [
    {
        name: 'domain',
        templateFile: 'template/ejs/pighand-spring/domain.ejs',
        saveFilePath: 'domain',
        fileExtension: 'java',
    },
    {
        name: 'VO',
        templateFile: 'template/ejs/pighand-spring/vo.ejs',
        saveFilePath: 'vo',
        fileExtension: 'java',
    },
    {
        name: 'mapper',
        templateFile: 'template/ejs/pighand-spring/mapper.ejs',
        saveFilePath: 'mapper',
        fileExtension: 'java',
    },
    {
        name: 'mapper',
        templateFile: 'template/ejs/pighand-spring/xml.ejs',
        fileExtension: 'xml',
    },
    {
        name: 'service',
        templateFile: 'template/ejs/pighand-spring/service.ejs',
        saveFilePath: 'service',
        fileExtension: 'java',
    },
    {
        name: 'serviceImpl',
        templateFile: 'template/ejs/pighand-spring/serviceImpl.ejs',
        saveFilePath: 'service/impl',
        fileExtension: 'java',
    },
    {
        name: 'controller',
        templateFile: 'template/ejs/pighand-spring/controller.ejs',
        saveFilePath: 'controller',
        fileExtension: 'java',
    },
];

export { config };
