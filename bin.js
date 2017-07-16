#!/usr/bin/env node

const parseArgs = require('minimist');
const getManifest = require('./lib/manifest');
const shell = require('shelljs');

const err = (e) => {
  console.log(e);
  process.exit(1);
};
const done = (data) => {
  if (typeof data === 'string') console.log(data);
  process.exit(0);
};

const isWin = /^win/.test(process.platform);

const makeDir = (buildId) => {
  const flags = (!isWin) ? '-p' : '';
  const cmd = 'mkdir ' + flags + ' ' + buildId;
  console.log(cmd);
  console.log(shell.exec(cmd).stdout);
};

const downloadFile = ({ source, destination }) => {
  const cmd = 'wget --check-certificate=off -q ' + source + ' -O ' + destination;
  console.log(shell.exec(cmd).stdout);  
};

const updateLatest = (buildId) => {
  const cmdRemove = 'rm -rf latest';
  console.log(shell.exec(cmdRemove).stdout);  
  const cmdCreate = 'cp -rf ' + buildId + ' latest';
  console.log(shell.exec(cmdCreate).stdout);  
};

if (process.mainModule && process.mainModule.filename === __filename) {
   const args = parseArgs(process.argv, { '--': true });
   const url = args._[2];
   if (url) {
      getManifest(url).then(({ buildId, queue }) => { 
        makeDir(buildId);
	queue.forEach(downloadFile);
	updateLatest(buildId);
      }).then(done);
   } else {
      err( [ "USAGE: assets-save <url>" ].join('\n'));
   }

} else {
  err( [ "ERROR: assets-save -- not in main module" ].join('\n'));
}


