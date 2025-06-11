const fs = require('fs');
const path = require('path');

/**
 * Load config file either from Render secrets path or local configs folder.
 * @param {string} fileName - The name of the config file, e.g., 'dbconfig.json'
 * @returns {Object} The parsed config object
 */
function loadConfig(fileName) {
  const renderPath = `/etc/secrets/${fileName}`;
  const localPath = path.join(__dirname, '..', 'configs', fileName);
  const configPath = fs.existsSync(renderPath) ? renderPath : localPath;
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function resolveFilePath(filename) {
  const renderPath = `/etc/secrets/${filename}`;
  const localPath = path.join(__dirname, '..', 'configs', filename);
  return fs.existsSync(renderPath) ? renderPath : localPath;
}

module.exports = {
    loadConfig,
    resolveFilePath
};
