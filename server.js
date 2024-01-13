const express = require('express')
const cors = require('cors')



const app = express()
const port = 8080

app.use(cors())
const path = require('path');
const fs = require('fs');

// console.log('dirname: ', __dirname);
// console.log('path: ', path.join(__dirname, '/react/public/uploads'));
  // app.use('/uploads', express.static(__dirname + '/react/public/uploads'));
  // app.use(express.static(path.resolve('./react/public/uploads')));
  // app.use(express.static(__dirname + '/react/public'));

const multer = require('multer')

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
  destination: function (req, file, cb) {
    cb(null, './react/public/uploads')
    // cb(null, './uploads')
  },
})

const upload = multer({ storage })

function readAllFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const getFilesArr = [];
  for (const file of files) {
    // if (file.isDirectory()) {
    //   yield* readAllFiles(path.join(dir, file.name));
    // } else {
    //   yield path.join(dir, file.name);
    // }
    if (!getFilesArr.includes(files)) {
      getFilesArr.push(files)
    }
  }
  return getFilesArr;
}

app.get('/', (req, res) => {
    const allAlreadyUploaded = readAllFiles('./react/public/uploads');
    console.log('ALL ALLREADY ', allAlreadyUploaded[0]);
    res.json({'data': allAlreadyUploaded[0]});
});

app.get('/uploads', (req, res) => {
  // return path;
});

app.get('/uploads/*', (req, res) => {
  console.log(path);
  // return path;
  res.send({'data': req.files[0].filename})
});

app.post('/upload_files', upload.any('file'), (req, res) => {
    console.log('hey req: ', req);
    
    res.send({ message: 'Successfully uploaded files', fileName: req.files[0].filename })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})