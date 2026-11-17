import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const MIN_NODE_MAJOR = 20;

// Check environment variables, permissions, and required tools
const preProcess = (answers) => {
    const majorVersion = parseInt(process.versions.node.split('.')[0], 10);
    if (Number.isNaN(majorVersion) || majorVersion < MIN_NODE_MAJOR) {
        throw new Error(
            `Node.js v${MIN_NODE_MAJOR}.0.0 or higher is required (current: v${process.versions.node}).`
        );
    }

    try {
        fs.accessSync(process.cwd(), fs.constants.W_OK);
    } catch (err) {
        if (err.code === 'EACCES' || err.code === 'EPERM') {
            throw new Error(
                `Permission denied (${err.code}): Cannot write to directory "${process.cwd()}".`
            );
        }
        throw new Error(`Cannot access target parent directory "${process.cwd()}": ${err.message}`);
    }

    const targetPath = path.resolve(process.cwd(), answers.projectName);
    if (fs.existsSync(targetPath)) {
        throw new Error(`Target directory already exists: "${targetPath}".`);
    }

    const missingTools = [];

    try {
        execFileSync('git', ['--version'], { stdio: 'ignore' });
    } catch {
        missingTools.push('Git');
    }

    if (answers.dbType !== 'none') {
        try {
            execFileSync('docker', ['--version'], { stdio: 'ignore' });
            execFileSync('docker', ['compose', 'version'], { stdio: 'ignore' });
        } catch {
            missingTools.push('Docker (with Docker Compose v2)');
        }
    }

    if (missingTools.length > 0) {
        const toolList = missingTools.join(' and ');

        throw new Error(
            `Missing required tools: ${toolList}.\n` +
            `Please install ${toolList} to proceed with your current configuration.`
        );
    }

    return true;
};

// Execute post-generation tasks
const postProcess = async (targetPath, answers) => {
    console.log('\nPackage installing...');
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFileSync(npmCmd, ['install'], {
        cwd: targetPath,
        stdio: 'inherit'
    });
};

export { preProcess, postProcess };