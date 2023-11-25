import { templateConfig } from '../../common/config.mjs';

const config: Array<templateConfig> = [
    {
        name: 'domain',
        templateFile: 'template/ejs/pighand-spring-v1/domain.ejs',
        saveFilePath: 'domain',
        fileExtension: 'java',
    },
    {
        name: 'VO',
        templateFile: 'template/ejs/pighand-spring-v1/vo.ejs',
        saveFilePath: 'vo',
        fileExtension: 'java',
    },
    {
        name: 'mapper',
        templateFile: 'template/ejs/pighand-spring-v1/mapper.ejs',
        saveFilePath: 'mapper',
        fileExtension: 'java',
    },
    {
        name: 'mapper',
        templateFile: 'template/ejs/pighand-spring-v1/xml.ejs',
        fileExtension: 'xml',
    },
    {
        name: 'service',
        templateFile: 'template/ejs/pighand-spring-v1/service.ejs',
        saveFilePath: 'service',
        fileExtension: 'java',
    },
    {
        name: 'serviceImpl',
        templateFile: 'template/ejs/pighand-spring-v1/serviceImpl.ejs',
        saveFilePath: 'service/impl',
        fileExtension: 'java',
    },
    {
        name: 'controller',
        templateFile: 'template/ejs/pighand-spring-v1/controller.ejs',
        saveFilePath: 'controller',
        fileExtension: 'java',
    },
];

export { config };
