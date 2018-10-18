#!/usr/bin/env node

const parseArgs = require('minimist');
const getManifest = require('./lib/manifest');
const shell = require('shelljs');
const fs = require('fs');

const err = (e) => {
  console.log(e);
  process.exit(1);
};
const done = (data) => {
  if (typeof data === 'string') console.log(data);
  process.exit(0);
};

const isWin = /^win/.test(process.platform);
const _log = a => { if (a) console.log(a); };

const makeDir = (buildId) => {
  const flags = (!isWin) ? '-p' : '';
  const cmd = 'mkdir ' + flags + ' ' + buildId;
  _log(cmd);
  _log(shell.exec(cmd).stdout);
};

const downloadFile = ({ source, destination }) => {
  const cmd = 'wget --check-certificate=off -q ' + source + ' -O ' + destination;
  // _log(cmd);
  _log(shell.exec(cmd).stdout);  
};

const updateLatest = (buildId) => {
  const cmdRemove = 'rm -rf latest';
  _log(shell.exec(cmdRemove).stdout);  
  const cmdCreate = 'cp -rf ' + buildId + ' latest';
  _log(shell.exec(cmdCreate).stdout);  
  const cmdVersion = 'echo ' + buildId + ' > version.txt';
  _log(shell.exec(cmdVersion).stdout);
  _log("Latest Build ID: " + buildId);
};

const saveManifest = (buildId, doc) => {
  fs.writeFileSync("./" + buildId + '/asset-manifest.json', JSON.stringify(doc, null, 2));
  _log("asset manifest: " + Object.keys(doc).length + " assets");
}

if (process.mainModule && process.mainModule.filename === __filename) {
   const args = parseArgs(process.argv, { '--': true });
   const url = args._[2];
   if (url) {
      getManifest(url).then(({ manifest, buildId, queue }) => { 
        if (!fs.existsSync(buildId)) makeDir(buildId);
	queue.forEach(downloadFile);
	saveManifest(buildId, manifest);
	updateLatest(buildId);
      }).then(done);
   } else {
      err( [ "USAGE: assets-save <url>" ].join('\n'));
   }

} else {
  err( [ "ERROR: assets-save -- not in main module" ].join('\n'));
}


