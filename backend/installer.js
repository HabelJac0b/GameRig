const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const nodeModules = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModules)) fs.mkdirSync(nodeModules, { recursive: true });

function downloadTgz(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadTgz(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function installPkg(name, version) {
  console.log('Fetching', name, version);
  const infoUrl = `https://registry.npmjs.org/${name}/${version}`;
  const info = JSON.parse(await new Promise((res, rej) => {
    https.get(infoUrl, r => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => res(data));
    });
  }));
  const tarball = info.dist.tarball;
  const safeName = name.replace('/', '_');
  const tmpFile = path.join(nodeModules, safeName + '.tgz');
  await downloadTgz(tarball, tmpFile);
  const pkgDir = path.join(nodeModules, name);
  if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });
  execSync(`tar -xzf "${tmpFile}" -C "${pkgDir}" --strip-components=1`);
  fs.unlinkSync(tmpFile);
  console.log('Successfully installed', name);
}

async function main() {
  await installPkg('mysql2', '3.9.7');
  await installPkg('denque', '2.1.0');
  await installPkg('iconv-lite', '0.6.3');
  await installPkg('lru-cache', '8.0.5');
  await installPkg('seq-queue', '0.0.5');
  await installPkg('sqlstring', '2.3.3');
  await installPkg('aws-ssl-profiles', '1.1.2');
  await installPkg('safer-buffer', '2.1.2');
  await installPkg('long', '5.2.3');
  await installPkg('named-placeholders', '1.1.3');
  await installPkg('generate-function', '2.3.1');
  await installPkg('is-property', '1.0.2');
  console.log('🎉 ALL MYSQL2 PACKAGES INSTALLED!');
}

main().catch(console.error);
