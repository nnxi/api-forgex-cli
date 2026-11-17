#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import prompt from './src/question.js';
import { preProcess, postProcess } from './src/environment.js';
import gitClone from './src/template.js';
import rendering from './src/generator.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = fs.readJsonSync(path.join(__dirname, 'package.json'));

const TEMPLATE_REPO = 'https://github.com/nnxi/api-forgex-template';
let tempPath;

const args = process.argv.slice(2);

if (args.includes('-v') || args.includes('--version')) {
    console.log(`api-forgex-cli version ${pkg.version}`);
    process.exit(0);
}

if (args.includes('-h') || args.includes('--help')) {
    console.log(`
Usage: npx api-forgex-cli [options]

A CLI tool for generating Node.js  API boilerplates using Express.

Options:
  -v, --version    Output the current version
  -h, --help       Display help for command
    `);
    process.exit(0);
}

async function run() {
    let targetPath;
    let targetCreated = false;
    let exitCode = 0;

    const cleanupOnSignal = () => {
        if (tempPath && fs.pathExistsSync(tempPath)) {
            fs.removeSync(tempPath);
        }
        if (targetCreated && targetPath && fs.pathExistsSync(targetPath)) {
            fs.removeSync(targetPath);
        }
        console.log('\nSetup cancelled.');
        process.exit(130);
    };

    process.once('SIGINT', cleanupOnSignal);

    try {
        const answers = await prompt();

        preProcess(answers);

        tempPath = await gitClone(TEMPLATE_REPO);

        targetPath = path.resolve(process.cwd(), answers.projectName);
        if (!(await fs.pathExists(targetPath))) {
            targetCreated = true;
        }

        await rendering(tempPath, targetPath, answers);

        console.log('\nProject generation completed successfully!');

        await postProcess(targetPath, answers);

        console.log('\nProject setup completed successfully.');
        console.log('You can now start the server with the following commands:\n');
        console.log(`  cd ${answers.projectName}`);
        if (answers.dbType !== 'none') {
            console.log('  docker compose up -d');
        }
        console.log('  npm start\n');

    } catch (err) {
        if (err.name === 'ExitPromptError') {
            console.log('\nSetup cancelled.');
        } else {
            if (targetCreated && targetPath && (await fs.pathExists(targetPath))) {
                await fs.remove(targetPath).catch(() => {});
            }
            console.error(`\nError: ${err.message}`);
            exitCode = 1;
        }
    } finally {
        process.removeListener('SIGINT', cleanupOnSignal);
        if (tempPath && (await fs.pathExists(tempPath))) {
            await fs.remove(tempPath).catch(() => {});
        }
        if (exitCode !== 0) {
            process.exit(exitCode);
        }
    }
}

run();