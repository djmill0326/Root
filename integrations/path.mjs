import { opendirSync } from "fs";
import { join } from "path";
import { cwd } from "process";
const backlevels = 3;
const ext = ".mjs";
export function fish(get, mesh) {
    const stuff = [];
    for (let thing = get(); thing; thing = get()) 
        if (mesh(thing)) stuff.push(thing);
    return stuff;
}
export const root = `${"../".repeat(backlevels)}Root/`;
const iter = opendirSync(root);
export default join(root, ...fish(iter.readSync.bind(iter), v => v?.name.endsWith(ext)).map($ => console.log(`Got file: ${$.path}${$.name} (${join(cwd(), $.path, $.name)})`) || $.name));
// Doing this because I can (check commit history)
queueMicrotask(async () => await iter.close());