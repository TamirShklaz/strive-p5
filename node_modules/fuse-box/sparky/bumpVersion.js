"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bumpVersion = void 0;
function bumpVersion(stringJson, opts) {
    let json;
    json = JSON.parse(stringJson);
    let version = json.version || '1.0.0';
    const type = opts.type;
    let matched = version.match(/(\d{1,}).(\d{1,})\.(\d{1,})(-(\w{1,})\.(\d{1,}))?/i);
    let major = 1 * matched[1];
    let minor = 1 * matched[2];
    let patch = 1 * matched[3];
    let addonName = matched[5];
    let addonNumber = matched[6];
    const resetAddon = () => {
        addonName = undefined;
        addonNumber = undefined;
    };
    if (type === 'patch') {
        resetAddon();
        patch++;
    }
    else if (type === 'minor') {
        minor++;
        patch = 0;
        resetAddon();
    }
    else if (type === 'major') {
        patch = 0;
        minor = 0;
        resetAddon();
        major++;
    }
    else {
        if (addonName === type && addonNumber > -1) {
            addonNumber++;
        }
        else {
            addonName = type;
            addonNumber = 1;
        }
    }
    const base = [`${major}.${minor}.${patch}`];
    if (addonName) {
        base.push(`-${addonName}.${addonNumber}`);
    }
    const finalVersion = base.join('');
    json.version = finalVersion;
    return JSON.stringify(json, null, 2);
}
exports.bumpVersion = bumpVersion;
