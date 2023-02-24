import * as child_process from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

/**
 * This will use the package.json to create a list of Cordova/Capacitor plugins and their versions
 * and write this file to assets/app-data.json as well as to readme.md
 * This is used to provide advice on what plugins may not work with your app
 */
async function list() {
  const data = JSON.parse(await getRunOutput('npm list --json', './'));
  const output: AppInfo = { plugins: [] };
  const readmeLines = readFileSync('./README.md','utf8').split('\n');
  let md: string = '';
  for (let pkg of Object.keys(data.dependencies)) {
    let plugin = true;
    if (pkg.startsWith('@angular')) plugin = false;
    if (pkg.startsWith('karma')) plugin = false;
    if (pkg.startsWith('jasmine')) plugin = false;
    if (pkg.startsWith('eslint')) plugin = false;
    if (pkg.startsWith('@typescript')) plugin = false;
    if (pkg.startsWith('@types')) plugin = false;
    if (pkg.startsWith('@ionic/')) plugin = false;
    if (pkg.startsWith('__')) plugin = false;
    if ([
      'zone.js', 'typescript', 'tslib', 'rxjs', 'ionicons', '@capacitor/cli',
      '@capacitor/assets', '@capacitor/android', '@capacitor/ios', '@capacitor/core'
    ].includes(pkg)) plugin = false;
    if (plugin) {
      output.plugins.push({ name: pkg, version: data.dependencies[pkg].version });
      md += ` - **${pkg}** - ${data.dependencies[pkg].version}\n`;
    }
  }
  writeFileSync('./assets/app-data.json', JSON.stringify(output, null, 2));  

  let readme: string = '';
  let include = true;
  for (let line of readmeLines) {
    if (line.startsWith('<!--- Generated Plugins End -->')) {
      include = true;
    }
    if (include) {
      readme += `${line}\n`;
    }
    if (line.startsWith('<!--- Generated Plugins -->')) {
      include = false;
      readme += md;
    }
  }
  writeFileSync('./README.md', readme);
}



list();

async function getRunOutput(command: string, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let out = '';
    opts:
    command = command;
    child_process.exec(
      command,
      runOptions(folder),
      (error, stdout, stdError) => {
        if (stdout) {
          out += stdout;
        }
        if (!error) {
          resolve(out);
        } else {
          if (stdError) {
            reject(stdError);
          } else {
            // This is to fix a bug in npm outdated where it returns an exit code when it succeeds
            resolve(out);
          }
        }
      }
    );
  });
}

function runOptions(folder: string) {
  const env = { ...process.env };
  env['LANG'] = 'en_US.UTF-8';
  return { cwd: folder, encoding: 'utf8', env: env };
}

interface AppInfo {
  plugins: Array<Plugin>
}

interface Plugin {
  name: string;
  version: string;
}