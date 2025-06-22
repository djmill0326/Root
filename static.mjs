import { createServer } from "http";
import { createGzip } from "zlib";
import { createReadStream, stat, opendirSync } from "fs";

// replace if this doesn't work for your setup
const ADAPTER_PORT = parseInt(process.argv[2]);
const HOST = "http://dopefiles.xyz";
const PORT = 80;
const STATIC_ROOT = ".";

// adjust mime lookup object as needed
import mimes from "../Web/fakels/html/js/mime.mjs";

const mime = (url, res) => {
    const ext = url.substring(url.lastIndexOf(".") + 1, url.length);
    const type = mimes[ext];
    if (res && typeof type === "string") res.writeHead(200, "epic swag", { 'Content-Type': type});
    return type;
}

let bg_count = 0;
const dir_iter = opendirSync(STATIC_ROOT + "/mp4");
for (let dir = dir_iter.readSync(); dir !== null; dir = dir_iter.readSync()) if (dir.name.startsWith("veo")) bg_count++;
console.log(`(bg-provider) provides ${bg_count} backgrounds.`);
dir_iter.closeSync();
let bg_index = 0;

const transform = (url) => {
    // query handling left up to spirits
    let q; if ((q = url.indexOf("?")) !== -1) return { r: transform(url.substring(0, q)), q: url.substring(q + 1) };
    const decoded = decodeURIComponent(url);
    const replace = decoded.replace("veo", `veo${bg_index = (bg_index + 1) % bg_count}`).replace("Wurst", "Worst");
    let output = STATIC_ROOT + replace;
    if (decoded !== replace) console.log("(bg-provider) provided background", output);
    if (url.charAt(url.length - 1) === "/") output += "index.html";
    return output;
}

const err = (url, res) => {
    console.log(`request for ${url} (not found)`);
    res.writeHead(404, `failed to get file at location <${url}>, ain't shit there.`);
    res.end();
}

const r = (url, res) => {
    if (url.q && (url.q.length < 3 || -1 === url.q.indexOf("="))) {
        res.writeHead(304, "dumbass query params");
        res.end();
    } else return true;
};

const pipe = (path, to, zip=true) => {
    const input = createReadStream(path);
    (zip ? input.pipe(createGzip({ level: 9 })) : input).pipe(to);
}

const redir = (res, to, message) => {
    res.setHeader("Location", to);
    res.statusCode = 308;
    res.statusMessage = message;
    res.end();
};

const paths = new Set(["raw", "stylish"]);

const send = (res, url, compress) => {
    const x = transform(url);
    if (r(x, res)) {
        const url = x.r ? x.r : x;
        stat(url, (error, stats) => {
            if (!error && stats.isFile()) {
                if (stats.size === 583) res.setHeader("Cache-Control", "max-age=0");
                if (compress) res.setHeader("Content-Encoding", "gzip");
                res.setHeader("Adapter-Port", ADAPTER_PORT);
                res.setHeader("Last-Modified", stats.mtime.toUTCString());
                console.log(`request for ${url}. size: ${stats.size}`);
                mime(url, res);
                pipe(url, res, compress);
            } else {
                const prefixLength = url.indexOf("./" ) + 2;
                const end = url.indexOf("/", prefixLength);
                const path = url.slice(prefixLength, end === -1 ? void 0 : end);
                return send(res, paths.has(path) ? `/${path}.html` : "/", compress);
            }
        });
    };
};

const server = createServer((req, res) => {
    try {
        if (req.url.startsWith("/rebind")) return redir(res, `${HOST}:${ADAPTER_PORT}/rebind ${req.url.slice(10)}`, "Rebind & Redirect");
        if (req.url.startsWith("/winwm")) return redir(res, HOST, "Back to winwm");
        const agent = req.headers["user-agent"] || "";
        const compress = !agent.includes("Chrome");
        send(res, req.url, compress);
    } catch(err) {
        console.warn("A request died somewhere; sad.");
        console.debug(err);
    }
    
});

const cd = '\u001b[3';
const cl = '\u001b[9';
const cr = '\u001b[39m';

import("socket.io").then(({ Server }) => {
    const io = new Server(server);
    const connections = {};
    io.on('connection', (socket) => {
        connections[socket.id] = socket;
        console.log('user connected');  
        socket.on('disconnect', () => {
            console.log('user disconnected. leaking memory...');
        });
        const rpc = (client, event, data) => {
            if (connections[client]) {
                connections[client].emit("rpc", {
                    client: socket.id, event, data
                });
            }
        };
        socket.on('rpc', (payload) => {
            console.log("received call", payload);
            switch (payload.event) {
                case "link":
                    rpc(payload.data, "link", socket.id);
                    break;
                default:
                    console.log("default rpc to " + payload.client);
                    rpc(payload.client, payload.event, payload.data);
            }
        });
    });

    server.listen(PORT, () => console.log(`${cl}0mserver listening on port ${cd}3m${PORT}${cr}/${cl}1m${ADAPTER_PORT}${cr}`));
});