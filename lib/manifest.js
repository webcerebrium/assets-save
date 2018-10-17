const path = require('path');
const fs = require('fs');
const request = require('request');
const shell = require('shelljs');

const downloadManifest = (url) => {
  const buildId = path.basename(path.dirname(url));
  const baseUrl = path.dirname(url);
  return new Promise(
    (resolve, reject) => {
 
      const queue = [];
      request({ url }, (error, response, body) => {
	if (error) reject(error);
	const doc = JSON.parse(body);
  	if (doc.error) reject('ERROR: Manifest receiving error: ' + doc.error);
	Object.keys(doc).forEach((alias) => {

          const dir = path.dirname(alias);
          if (dir && dir !== '.') {
            const dirToCheck = './' + buildId + '/' + path.dirname(alias);
            if (!fs.existsSync(dirToCheck)) {
              console.log('creating dir', path.dirname(alias));
              shell.mkdir('-p', dirToCheck );
            }
          }
          queue.push({ 
            source: baseUrl +  doc[alias],  
            destination: './' + buildId + '/' + alias
          });
	});
	resolve({ buildId, queue, manifest: doc });
      });
    }
  );
};

module.exports = downloadManifest;

