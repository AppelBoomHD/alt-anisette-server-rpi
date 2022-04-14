const http = require('http');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function splitLines(t) { return t.split(/\r\n|\r|\n/); }

async function _getAnisetteData() {
  const { stdout, stderr } = await exec("AltWindowsAnisette.exe")

  let resbody = {}
  
  const lines = splitLines(stdout)
  for (const line of lines) {
     const lineparts = line.split(': ', 2)
     resbody[lineparts[0]] = lineparts[1]
  }
  console.log("Generated anisetteData: " + JSON.stringify(resbody))
  return resbody
}

let anisetteStore = {
  data: null,
  update: null,
}
const anisetteCacheTime = 20

async function getAnisetteData() {
  if (!anisetteStore.data || new Date() - anisetteStore.update > anisetteCacheTime * 1000) {
      anisetteStore.data = await _getAnisetteData()
      anisetteStore.update = new Date()
  }
  return anisetteStore.data
}

const hostname = '0.0.0.0';
const port = 6969;

const server = http.createServer(async (req, res) => {
  console.log("[" + new Date() + "] - " + req.socket.localAddress + " - " + req.method + " " + req.url)
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  
  let resbody = null  
  try {
    const retJson = await getAnisetteData()
    retbody = JSON.stringify(retJson)
  } catch (e) {
    console.log(e)
    resbody = e
  }
  res.end(retbody);
});

server.listen(port, hostname, () => {
  console.log(`Anisette Server running at http://${hostname}:${port}/`);
});