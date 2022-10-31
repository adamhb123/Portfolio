const fs = require("fs");
const crypto = require("crypto");
const spawn = require("child_process").spawn;
const express = require("express");
const cors = require("cors");
const https = require("https");
const { exit } = require("process");
const sqlite3 = require("sqlite3").verbose();
const app = express();
require("dotenv").config({ path: "../../.env" });
const _port = process.env.REACT_APP_BACKMAN_PORT || 6969;
const _hostname = process.env.REACT_APP_HOSTNAME || "0.0.0.0";

app.use(cors({ origin: true }));
app.use(function (req, res, next) {
    req.rawBody = "";
    req.setEncoding("utf8");
    req.on("data", function (chunk) {
        req.rawBody += chunk;
    });
    req.on("end", function () {
        next();
    });
});

function pull_git_repo_and_rebuild() {
    const spawned_proc = spawn(`git stash save; git fetch origin master && git reset --hard FETCH_HEAD && git clean -df && npm run build-prod && service apache2 restart; git stash apply`,
    { cwd: __filename.substring(0, __filename.lastIndexOf('/', __filename.lastIndexOf('/') - 1)), shell: true });
    spawned_proc.stdout.on('data', (data) => console.log(data.toString()));
    spawned_proc.stderr.on('data', (data) => console.log(data.toString()));
    spawned_proc.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
function _check_err(err) {
    if (err) {
        console.error(err.message);
    }
}

function get_blog_posts() {
    return new Promise((resolve) => {
        let dbName = __dirname + "/db/blog.db";
        console.log("DB Name: " + dbName);
        let db = new sqlite3.Database(dbName, sqlite3.OPEN_READONLY, _check_err);
        db.all("SELECT * FROM posts ORDER BY key DESC", (err, rows) => {
            _check_err(err);
            resolve(rows);
        });
        db.close(_check_err);
    });
}

function verify_webhook_signature(req, res, next) {
    const secret = process.env.PUSHUP_SECRET;
    if (!secret) return next("PUSHUP_SECRET not provided, webhook verification disabled")
    if (!req.rawBody) {
        return next("Request body empty");
    }
    console.log("Received pushup");
    const sigHeaderName = "X-Hub-Signature-256";
    const sigHashAlg = "sha256";
    const sig = Buffer.from(req.get(sigHeaderName) || "", "utf8");
    const hmac = crypto.createHmac(sigHashAlg, secret);
    const digest = Buffer.from(sigHashAlg + "=" + hmac.update(req.rawBody).digest("hex"), "utf8");
    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`);
    }
    return next();
}

app.get("/api/get-blog-posts", (req, res) => {
    get_blog_posts().then((posts) => res.json({ posts: posts }));
});

if (process.env.PUSHUP_SECRET || process.env.NODE_ENV != "production") {
    console.log("register pushup")
    app.post("/api/pushup", verify_webhook_signature, (req, res, next) => {
        console.log("Git push received, update when possible!");
        res.status(200).send("Triggering git pull and app restart")
    });
}
pull_git_repo_and_rebuild()
if (process.env.NODE_ENV == "production") {
    https.createServer(
        {
            key: fs.readFileSync("/etc/letsencrypt/live/adabrew.com/privkey.pem"),
            cert: fs.readFileSync("/etc/letsencrypt/live/adabrew.com/cert.pem"),
            ca: fs.readFileSync("/etc/letsencrypt/live/adabrew.com/chain.pem")
        }, app).listen(port, () => {
            console.log(`(HTTPS) Backman on port ${port}`);
        });
}
else {
    app.listen(_port, _hostname, () => {
        console.log(`(HTTP) Backman host ${_hostname} on port ${_port}`);
    });
}