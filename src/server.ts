import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as child_process from 'child_process';
import * as fs from 'fs';
import {uuidv4} from './uuid';
import * as cors from 'cors';
import {startHttpsServer} from './https-server';

const app = express();
app.use(cors());

const GEN = `gen`;
const genDir = path.join(__dirname, GEN);

if (!fs.existsSync(genDir)) {
  fs.mkdirSync(genDir);
}

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(`/${GEN}`, express.static(genDir));
app.use(`/.well-known`, express.static(path.join(__dirname, '../.well-known')));

app.post('/api/athena', function(req, res) {
  const url = req.body.url;
  const jobId = uuidv4();
  const jobDir = path.join(genDir, jobId);
  const outFileName = `out.pdf`;
  const outPath = `${jobDir}/${outFileName}`;
  fs.mkdirSync(jobDir); // OPTIMIZE: sync is not ideal...
  child_process.exec(`curl http://localhost:8080/convert\\?auth\\=arachnys-weaver\\&url\\=${url} > ${outPath}`, {
    cwd: jobDir,
    timeout: 10000
  }, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send({
        ...error
      });
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      res.status(200).send({
        id: jobId,
        link: `/${GEN}/${jobId}/${outFileName}`
      });
    }
  })
});

app.post('/api/compile', function (req, res) {
  const payload = req.body;
  const jobId = uuidv4();
  const jobDir = path.join(genDir, jobId);
  const inPath = `${jobDir}/main.tex`;
  const logPath = `${jobDir}/main.log`;
  const link = `/${GEN}/${jobId}/main.pdf`;

  fs.mkdirSync(jobDir); // OPTIMIZE: sync is not ideal...
  // TODO: add a payload.images property, in order to DL all images upfront...?
  fs.writeFile(inPath, payload.latex, (writeFileError) => {

    if (writeFileError) {
      res.status(500).send(writeFileError.message);
    } else {

      const process = child_process.exec(`pdflatex ${inPath}`, {
        cwd: jobDir,
        timeout: 2000
      }, (error, stdout, stderr) => {
        if (error) {
          res.status(500).send({
            ...error,
            log: fs.readFileSync(logPath)
          });
        } else {
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          res.status(200).send({
            id: jobId,
            link: link
          });
        }
      });

    }

  });

});


// Starting http
const httpServer = http.createServer(app);
httpServer.listen(80, () => {
  console.log('HTTP Server running on port 80');
});


startHttpsServer(app);
