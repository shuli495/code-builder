/**
 * 格式化表名，下划线转驼峰
 * @param {string} tableName 表名
 * @returns {string} 驼峰格式表名
 */
function hump(tableName: string) {
    if (!tableName.includes('_')) {
        return tableName;
    }

    const words = tableName.split('_');

    let newName = '';
    words.every((item) => {
        const word = item.trim();

        if (!word) {
            return true;
        }

        if (!newName) {
            newName += word;
        } else {
            newName += word.substring(0, 1).toUpperCase() + word.substring(1);
        }

        return true;
    });

    return newName;
}

/**
 * 表明转文件名
 * @param {string} tableName 表名
 * @returns {string} 文件名
 */
function file(tableName: string) {
    const humpName = hump(tableName);

    return humpName.substring(0, 1).toUpperCase() + humpName.substring(1);
}

export { hump, file };
