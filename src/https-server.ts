import * as fs from "fs";
import * as https from "https";

// Renewing SSL: https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
// - ssh into server
// - run 'certbot certonly --manual' and follow instructions

const DOMAIN = `latex.taskbase.com`;
const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/privkey.pem`, 'utf8');
const certificate = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/cert.pem`, 'utf8');
const ca = fs.readFileSync(`/etc/letsencrypt/live/${DOMAIN}/chain.pem`, 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

export function startHttpsServer(app) {
  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
}
