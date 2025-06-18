import { opendirSync } from "fs";
import { join } from "path";
const backlevels = 4;
const ext = ".mjs";
export function fish(get, mesh) {
    const stuff = [];
    for (let thing = get(); thing; thing = get()) 
        if (mesh(thing)) stuff.push(thing);
    console.log(stuff);
    return stuff;
}
export const root = `${"../".repeat(backlevels)}/Root/`;
const iter = opendirSync(root);
export default join(root, ...fish(iter.readSync.bind(iter), v => v?.name.endsWith(ext)).map($ => $.name));
// check commit history for more information
queueMicrotask(async () => await iter.close());