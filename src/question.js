import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

const PROJECT_NAME_REGEX = /^[a-z0-9][a-z0-9_-]*$/;

const getOptions = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project',
      filter: (input) => input.trim(),
      validate: (input) => {
        const trimmed = input.trim();
        if (!PROJECT_NAME_REGEX.test(trimmed)) {
          return 'Project name must start with a lowercase letter or number and contain only lowercase letters, numbers, "-", or "_".';
        }
        if (fs.existsSync(path.resolve(process.cwd(), trimmed))) {
          return `Directory "${trimmed}" already exists in the current path.`;
        }
        return true;
      }
    },
    {
      type: 'select',
      name: 'framework',
      message: 'Select a backend framework:',
      choices: [
        { name: 'Express', value: 'express' },
        { name: 'Fastify', value: 'fastify' }
      ],
      default: 'express'
    },
    {
      type: 'select',
      name: 'dbType',
      message: 'Select a database (Docker Compose):',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'PostgreSQL', value: 'postgres' }
      ],
      default: 'none'
    },
    {
      type: 'password',
      name: 'dbPassword',
      mask: '*',
      message: 'Database password \x1b[2m(leave blank for default)\x1b[0m:',
      when: (answers) => {
        if (answers.dbType === 'none') return false;
        const dbName = `${answers.projectName.replace(/-/g, '_')}_db`;
        const dbUser = answers.dbType === 'postgres' ? 'postgres' : 'root';
        const dbPort = answers.dbType === 'postgres' ? 5432 : 3306;
        console.log(`  \x1b[2m↳ DB Name: ${dbName} | User: ${dbUser} | Port: ${dbPort}\x1b[0m`);
        return true;
      },
      filter: (input) => input.trim() || 'root_password',
      validate: (input) => {
        const trimmed = input.trim();
        if (/[\s'"$`\\]/.test(trimmed)) {
          return 'Password cannot contain spaces, quotes, backslashes, or "$" characters.';
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'useJWT',
      message: 'Add JWT authentication boilerplate?',
      default: false
    },
    {
      type: 'confirm',
      name: 'useUsersDomain',
      message: 'Include User(Register/Login) API boilerplate?',
      when: (answers) => answers.dbType !== 'none' && answers.useJWT,
      default: false
    },
    {
      type: 'confirm',
      name: 'useApiDocGen',
      message: 'Include nodejs-api-docgen API documentation setup?',
      when: (answers) => answers.framework === 'express',
      default: false
    }/*,
    {
      type: 'confirm',
      name: 'useMonitoring',
      message: 'Include nodejs-api-stats real-time monitoring?',
      when: (answers) => answers.useApiDocGen,
      default: false
    }*/
  ]);

  return {
    dbPassword: 'root_password',
    useUsersDomain: false,
    useApiDocGen: false,
    useMonitoring: false,
    ...answers,
    useDB: answers.dbType !== 'none'
  };
};

export default getOptions;