const path = require('path');

const pascalCase = require('pascal-case');
const paramCase = require('param-case');
const pathExists = require('path-exists');

const templates = require('./templates');
const { hasPrefix, createFile, createFolder } = require('./utils');

const DEFAULT_NAME = 'Library';
const DEFAULT_PREFIX = 'RN';
const DEFAULT_MODULE_PREFIX = 'react-native';
const DEFAULT_PACKAGE_IDENTIFIER = 'com.reactlibrary';
const DEFAULT_PLATFORMS = ['android', 'ios', 'windows'];

module.exports = ({
  namespace,
  name = DEFAULT_NAME,
  prefix = DEFAULT_PREFIX,
  modulePrefix = DEFAULT_MODULE_PREFIX,
  packageIdentifier = DEFAULT_PACKAGE_IDENTIFIER,
  platforms = DEFAULT_PLATFORMS,
}) => {
  if (hasPrefix(name)) {
    throw new Error('Please don\'t include the prefix in the name');
  }

  if (prefix === 'RCT') {
    throw new Error(`The \`RCT\` name prefix is reserved for core React modules.
  Please use a different prefix.`);
  }

  if (pathExists.sync(path.join(process.cwd(), 'package.json'))) {
    throw new Error(`A \`package.json\` already exists in this path
  Please run the application in a different path.`);
  }

  if (platforms.length === 0) {
    throw new Error('Please specify at least one platform to generate the library.');
  }

  if (prefix === 'RN') {
    console.warn(`While \`RN\` is the default prefix,
  it is recommended to customize the prefix.`);
  }

  return Promise.all(templates.filter(template => {
    if (template.platform) {
      return (platforms.indexOf(template.platform) >= 0);
    }

    return true;
  }).map(template => {
    if (!template.name) {
      return Promise.resolve();
    }

    const args = {
      name: `${prefix}${pascalCase(name)}`,
      moduleName: `${modulePrefix}-${paramCase(name)}`,
      packageIdentifier,
      namespace: namespace || pascalCase(packageIdentifier).split(/(?=[A-Z])/).join('.'),
      platforms,
    };

    const filename = template.name(args);
    const baseDir = filename.split(path.basename(filename))[0];

    return createFolder(baseDir).then(() =>
      createFile(filename, template.content(args))
    );
  }));
};
