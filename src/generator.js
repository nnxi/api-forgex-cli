import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

const renderDirectory = async (tempDir, targetDir, answers) => {
    try {
        const queue = [{ src: tempDir, dest: targetDir }];

        while (queue.length > 0) {
            const { src, dest } = queue.shift();

            await fs.ensureDir(dest);

            const items = await fs.readdir(src, { withFileTypes: true });

            for (const item of items) {
                const srcPath = path.join(src, item.name);

                if (item.isDirectory()) {
                    queue.push({
                        src: srcPath,
                        dest: path.join(dest, item.name)
                    });
                } else if (item.name.endsWith('.ejs')) {
                    const targetItemName = item.name.slice(0, -4);
                    const content = await fs.readFile(srcPath, 'utf8');
                    const rendered = ejs.render(content, answers);
                    await fs.writeFile(path.join(dest, targetItemName), rendered, 'utf8');
                } else {
                    await fs.copyFile(srcPath, path.join(dest, item.name));
                }
            }
        }
    } catch (err) {
        throw new Error(`Directory rendering failed (${tempDir}): ${err.message}`);
    }
};

const rendering = async (tempPath, targetPath, answers) => {
    if (await fs.pathExists(targetPath)) {
        throw new Error(`Target directory already exists: "${targetPath}".`);
    }

    const templateRootPath = path.join(tempPath, 'template');
    await fs.ensureDir(targetPath);

    const baseDir = path.join(templateRootPath, 'base');
    if (!(await fs.pathExists(baseDir))) {
        throw new Error(`Base directory not found at: ${baseDir}. Check repository structure.`);
    }
    await renderDirectory(baseDir, targetPath, answers);

    const addonDirs = [
        answers.dbType !== 'none' && 'db',
        answers.useJWT && 'jwt',
        answers.useJWT && !answers.useUsersDomain && 'jwt_standalone',
        answers.useUsersDomain && 'usr'
    ].filter(Boolean);

    for (const addon of addonDirs) {
        const addonPath = path.join(templateRootPath, 'addons', addon);
        if (await fs.pathExists(addonPath)) {
            await renderDirectory(addonPath, targetPath, answers);
        }
    }

    return targetPath;
};

export default rendering;