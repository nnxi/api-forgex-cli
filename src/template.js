import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const gitClone = async (repoUrl) => {
    const tempPath = await fs.mkdtemp(path.join(os.tmpdir(), 'api-forgex-cli-'));

    try {
        console.log('Fetching templates from GitHub...');

        execFileSync('git', ['clone', '--depth', '1', repoUrl, tempPath], { stdio: 'ignore' });

        const gitConfigPath = path.join(tempPath, '.git');
        if (await fs.pathExists(gitConfigPath)) {
            await fs.remove(gitConfigPath);
        }

        return tempPath;
    } catch (err) {
        await fs.remove(tempPath).catch(() => {});
        throw new Error(`Failed to clone template repository: ${err.message}`);
    }
};

export default gitClone;