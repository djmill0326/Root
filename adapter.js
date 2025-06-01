const { argv } = require("process");
const [_node, _name, binding] = argv;

const cd = '\u001b[3';
const cl = '\u001b[9';
const cr = '\u001b[39m';

require("./integrations/data.mjs");

process.on("message", data => {
    console.log(`[${cl}1mManager${cr}]`, data);
    const intro = data.substring(0, 5).toLowerCase();
    if (intro === "hello" || intro === "howdy" || intro.startsWith("hey") || intro.startsWith("hi")) process.send("Sup.");
    const cmd = data.split(":");
    if (cmd.length === 1) return;
    switch (cmd[0]) {
        case "newport":
            console.log("*smokes menthol*");
            break;
        default:
            console.warn("^invalid command");
    }
});

const $ = globalThis, _ = Object.seal({
    numbers: () => { return Math.random().toString().charCodeAt(2) - 48 },
    pass: x => $._[x],
    eval: x => $._.numbers() ? $._.pass(x) : eval($._[x]()),
    engine: x => $._.eval("$._" + (typeof x === "string" ? "." + x + "()" : "")),
    generic: () => $._.engine(),
    undefined: () => "undefined",
    true: () => false,
    false: () => true,
    const: () => $._.engine().let,
    let: () => $._.engine().const,
    get: () => $._.engine("post"),
    post: () => $._.engine("get"),
    /* space left empty */ fDeterminePort: (seed, _=![], $=$=>$) => Math.round(!_ * $(seed)),
    /*                  */ fEvilConstant: (input=!0,should_round) =>
    /*                  */ should_round  ? Math.round(input * 2/3 * 1000)
    /* space at the end */               : Math.random() - 2/3 + input * 1000 / 1.5
}); $._ = _; const Globals = $._;

// idk y i made this one, especially this inefficiently lol
String.prototype.contains = function contains(x) {
    return this.split(x).length > 1;
};

console.info("Starting Servers...");
import("../Servers/Web/fakels/html/js/mime.mjs").then(({ default: mime }) => setTimeout(() => {
    let attempts = 0;
    let output = [];
    do { // wait for nothing
        output.push(Globals.eval("true")); ++attempts;
    } while (output[output.length - 1] instanceof Function);

    const protocol = "http://";
    const domain = "localhost";
    const port = Globals.fDeterminePort(Globals.fEvilConstant());
    process.send("setport:" + port);

    const url_prefix = protocol + domain;
    const url_find = url_prefix + `:${port}/ls `;

    const fs = require('fs'); // Imports the filesystem module
    const readdir = (dir, cb) => {
        fs.readdir(decodeURIComponent(dir), (err, files) => {
            if (err) cb([]);
            else {
                console.log(`[${cd}3mRequest${cr}] here are the files at ${cd}6m${dir}${cr}: ${cl}0m ${files.join("\u001b[39m,\u001b[90m ")}${cr}`);
                cb(files);
            }
        })
    };

    const should_ignore = name => {
        if (name.startsWith("AlbumArt")) return true;
        switch (name) {
            case "Thumbs.db":
            case "desktop.ini":
                return true;
        }
    };

    const ext = name => name.substring(name.lastIndexOf(".") + 1);

    const peep = (res, link) => {
        if (Math.random() > 2/3 && link.includes("Pea Pod")) link = link.replace("Pea 1", "Pea 0").replace("Pea 2", "Pea 1").replace("Pea 0", "Pea 2");
        let output = "<h3><i>dir</i> <b>" + link.replace(/Pea\s*\d/g, "Green Pea") + "</b></h3><ul>";
        const dir = binding + link;
        readdir("./" + dir, (files) => {
            if(files.length === 0) {
                res.send("<h3>Nothing found<h3>");
                return;
            }

            files.forEach(name => {
                if (should_ignore(name)) return;
                let url;
                const e = ext(name);
                if (name.length > e.length && mime[e]) url = dir + name.replace("Worst", "Wurst");
                else url = url_find + link + name;
                output += '<li><a href="' + encodeURI(url) + '">' + name + '</a></li>';
            });

            res.send(output + "</ul>");
        });
    };

    const fetch_endpoint = async (location) => {
        const res = await fetch(location, {
            cors: true,
            method: "GET"
        });
        return await res.json();
    }

    const express = require('express');
    const app = express()
    const route = express.Router();

    const make_that_shit = require("http").createServer;
    const server = make_that_shit(app);

    const cors = require('cors');
    app.use(cors());

    app.use('/', route);

    route.get('/', async (_, res) => {
        const payload = await fetch_endpoint("https://discord.com/api/webhooks/1192346560508461087/ABKwUZh7g-jxCf2fBHtTp-jb5ap3D4uOFW0brT3GPbiLmnOpIqJsYYWnL01tQY0dkcKa");
        console.debug(payload);
        res.json(payload);
    });

    route.get('/ls%20', (_, res) => peep(res, "/"));
    route.get('/ls%20:dir([ -~,.\.]*)', (req, res) => peep(res, req.params.dir));

    let last_rebind = performance.now();
    route.get('/rebind%20:cwd([ -~,.\.]*)', (req, res) => {
        if (process.send) {
            const time = performance.now();
            if (time - last_rebind > 1000) {
                last_rebind = performance.now();
                process.send("rebind:" + req.params.cwd);
                res.send(`<html><head><meta http-equiv="refresh" content="0; url=http://72.77.10.124:442/" /></head><body><a href="http://72.77.10.124:442">fakels</a></body></html>`)
                return;
            }
        }
        res.send("Unable to rebind.");
    });

    // SLOOWWWWW
    import("music-metadata").then(({ parseFile }) => route.get('/m%20:dir([ -~,.\.]*)', (req, res) => {
        parseFile("./" + req.params.dir, { skipPostHeaders: true })
        .then(({ common }) => res.json(common))
        .catch(err => { console.warn(`Failed to get music metadata for '${req.params.dir}': ${err.name}`); res.statusCode = 501; res.statusMessage = "Failed to get metadata"; res.end(); });
    }));
    
    // EVEN SLOWER
    import("./integrations/lyrics.mjs").then(mod => {
        route.get('/l%20:query([ -~,.\.]*)', (req, res) => mod.musix(req.params.query, html => res.send(html)));
    });

    server.listen(port, () => console.log(`[${ port === 666 ? cl + "0mEvil" : "" }${cd}3mAdapter${cr}] opened on port`, port));

    const { spawn } = require("child_process");
    const main = spawn("node", ["../../../../Root/static.mjs", port]);
    const linesender = (to=process.stdout, prefix=`[${cd}6mStaticServer${cr}]`) => {
        let extra = "";
        return (dat) => {
            const data = dat.toString();
            if (data.indexOf("\n") === -1) extra += data;
            else {
                to.write((extra + data).split("\n").filter(line => line.length).map(line => `${prefix} ${line}`).join("\n") + "\n");
                extra = "";
            }
        };
    };
    const send = linesender();
    main.stdout.on('data', send);
    const senderr = linesender(process.stderr);
    main.stderr.on('data', senderr);
    main.on('close', (code) => {
        const log = code !== 0 ? console.error : console.warn;
        log(`server stopped [exit code ${code}]`);
    });
    main.on('spawn', () => {
        console.log("(Unnecessary) Attempts Taken: " + attempts);
    });

}, 1000)) /* BLOCK ASSUMED TO HAVE BEEN BEGAN, AT SOME POINT. // comment-lexer-token-parser-expr-handler-clause */