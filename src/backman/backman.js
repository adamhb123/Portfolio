const sqlite3 = require("sqlite3").verbose();
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const spawn = require('child_process').spawn;
const app = express();
app.use(cors());
require('dotenv').config({ path: "../../.env" });
const port = process.env.BACKMAN_PORT ? process.env.BACKMAN_PORT : 6969;

app.use(function(req, res, next) {
    req.rawBody = '';
    req.setEncoding('utf8');
  
    req.on('data', function(chunk) { 
        req.rawBody += chunk;
    });
  
    req.on('end', function() {
        next();
    });
});

function _check_err(err){
    if(err){
        console.error(err.message);
    }
}

function get_blog_posts(){
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database(__dirname + '/db/blog.db', sqlite3.OPEN_READONLY, _check_err);
        db.all('SELECT * FROM posts ORDER BY key DESC', (err, rows) => {
            _check_err(err);
            resolve(rows);
        });
        db.close(_check_err);
    })
    
}

function verify_webhook_signature(req, res, next){
    if (!req.rawBody){
        return next('Request body empty');
    }
    console.log("Received pushup");
    const secret = process.env.PUSHUP_SECRET;
    const sigHeaderName = 'X-Hub-Signature-256';
    const sigHashAlg = 'sha256';
    const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
    const hmac = crypto.createHmac(sigHashAlg, secret);
    const digest = Buffer.from(sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8');
    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${sig})`);
    }
    return next();
}

function pull_latest_repo_updates(){
    spawn("git pull && shutdown -r now", {detached: true});
}

app.get('/api/get-blog-posts', (req, res) => {
    get_blog_posts().then((posts)=>res.json({posts: posts}));
});


if(process.env.PUSHUP_SECRET){
    app.post('/api/pushup', verify_webhook_signature, () => {
        pull_latest_repo_updates();
    });
      
    app.use((err, req, res, next) => {
        if (err) console.error(err);
        res.status(403).send('Request body was not signed or verification failed');
    })
}

  
app.listen(port, () => {
    console.log(`Backman on port ${port}`);
});