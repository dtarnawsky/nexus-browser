"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var child_process = require("child_process");
var fs_1 = require("fs");
/**
 * This will use the package.json to create a list of Cordova/Capacitor plugins and their versions
 * and write this file to assets/app-data.json as well as to readme.md
 * This is used to provide advice on what plugins may not work with your app
 */
function list() {
    return __awaiter(this, void 0, void 0, function () {
        var data, _a, _b, output, readmeLines, md, _i, _c, pkg, plugin, readme, include, _d, readmeLines_1, line;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, getRunOutput('npm list --json', './')];
                case 1:
                    data = _b.apply(_a, [_e.sent()]);
                    output = { plugins: [] };
                    readmeLines = (0, fs_1.readFileSync)('./README.md', 'utf8').split('\n');
                    md = '';
                    for (_i = 0, _c = Object.keys(data.dependencies); _i < _c.length; _i++) {
                        pkg = _c[_i];
                        plugin = true;
                        if (pkg.startsWith('@angular'))
                            plugin = false;
                        if (pkg.startsWith('karma'))
                            plugin = false;
                        if (pkg.startsWith('jasmine'))
                            plugin = false;
                        if (pkg.startsWith('eslint'))
                            plugin = false;
                        if (pkg.startsWith('@typescript'))
                            plugin = false;
                        if (pkg.startsWith('@types'))
                            plugin = false;
                        if (pkg.startsWith('@ionic/'))
                            plugin = false;
                        if (pkg.startsWith('__'))
                            plugin = false;
                        if ([
                            'zone.js', 'typescript', 'tslib', 'rxjs', 'ionicons', '@capacitor/cli',
                            '@capacitor/assets', '@capacitor/android', '@capacitor/ios', '@capacitor/core'
                        ].includes(pkg))
                            plugin = false;
                        if (plugin) {
                            output.plugins.push({ name: pkg, version: data.dependencies[pkg].version });
                            md += " - **".concat(pkg, "** - ").concat(data.dependencies[pkg].version, "\n");
                        }
                    }
                    (0, fs_1.writeFileSync)('./assets/app-data.json', JSON.stringify(output, null, 2));
                    readme = '';
                    include = true;
                    for (_d = 0, readmeLines_1 = readmeLines; _d < readmeLines_1.length; _d++) {
                        line = readmeLines_1[_d];
                        if (line.startsWith('<!--- Generated Plugins End -->')) {
                            include = true;
                        }
                        if (include) {
                            readme += "".concat(line, "\n");
                        }
                        if (line.startsWith('<!--- Generated Plugins -->')) {
                            include = false;
                            readme += md;
                        }
                    }
                    (0, fs_1.writeFileSync)('./README.md', readme);
                    return [2 /*return*/];
            }
        });
    });
}
list();
function getRunOutput(command, folder) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var out = '';
                    opts: command = command;
                    child_process.exec(command, runOptions(folder), function (error, stdout, stdError) {
                        if (stdout) {
                            out += stdout;
                        }
                        if (!error) {
                            resolve(out);
                        }
                        else {
                            if (stdError) {
                                reject(stdError);
                            }
                            else {
                                // This is to fix a bug in npm outdated where it returns an exit code when it succeeds
                                resolve(out);
                            }
                        }
                    });
                })];
        });
    });
}
function runOptions(folder) {
    var env = __assign({}, process.env);
    env['LANG'] = 'en_US.UTF-8';
    return { cwd: folder, encoding: 'utf8', env: env };
}
