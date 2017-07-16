const path = require('path');
const fs = require('fs');
const request = require('request');

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
          queue.push({ 
            source: baseUrl + '/' + doc[alias],  
            destination: './' + buildId + '/' + alias
          });
	});
	resolve({ buildId, queue });
      });
    }
  );
};

module.exports = downloadManifest;

