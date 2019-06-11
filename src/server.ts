import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as child_process from 'child_process';
import * as fs from 'fs';
import {uuidv4} from './uuid';
import * as cors from 'cors';

const app = express();
app.use(cors());

const genDir = path.join(__dirname, 'gen');

if (!fs.existsSync(genDir)) {
  fs.mkdirSync(genDir);
}


// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const PUBLIC_ASSETS_PREFIX = 'public';
app.use(`/${PUBLIC_ASSETS_PREFIX}`, express.static(genDir));

app.post('/api/compile', function (req, res) {
  const payload = req.body;
  const jobId = uuidv4();
  const jobDir = path.join(genDir, jobId);
  const inPath = `${jobDir}/main.tex`;

  fs.mkdirSync(jobDir); // OPTIMIZE: sync is not ideal...
  fs.writeFile(inPath, payload.latex, (writeFileError) => {

    if (writeFileError) {
      res.status(500).send(writeFileError.message);
    } else {
      try {
        const process = child_process.spawn('pdflatex', [inPath], {
          cwd: jobDir
        });
        let err = '';
        process.stderr.on('data', data => {
          err += data;
        });

        process.on('close', code => {
          if (err !== '') {
            res.status(500).send(err);
          } else {
            res.status(200).send({
              id: jobId,
              link: `/${PUBLIC_ASSETS_PREFIX}/${jobId}/main.pdf`
            });
          }
        });
      } catch (err) {
        console.log('An error occurred:', err);
      }

    }

  });

});

const port = process.argv[2] || 46536;
app.listen(port, function () {
  console.log(`server started on ${port}`);
});
