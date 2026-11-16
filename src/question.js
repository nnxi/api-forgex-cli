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
      type: 'confirm',
      name: 'useDB',
      message: 'Include MySQL database (Docker Compose)?',
      default: false
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
      when: (answers) => answers.useDB && answers.useJWT,
      default: false
    },
    {
      type: 'confirm',
      name: 'useApiDocGen',
      message: 'Include nodejs-api-docgen API documentation setup?',
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
    useUsersDomain: false,
    useMonitoring: false,
    ...answers
  };
};

export default getOptions;