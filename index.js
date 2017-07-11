const fs = require('fs');
const mkdirp = require('mkdirp');
const zlib = require('zlib');
const request = require('superagent');
const { table } = require('table');

const fetch = (item, opts) => {
    const baseUrl = item.baseUrl || 'https://cdn.bootcss.com/';
    const url = item.url || `${baseUrl}/${item.name}/${item.version}/${item.file}`;
    const level = opts ? opts.level : 1;
    console.log('fetching file:', url);
    return new Promise((resolve, reject) => {
        request
            .get(url)
            .buffer(true)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                if (res.status === 200) {
                    // write file to disk
                    const folder = `./download/${item.name}/${item.version}`;
                    if (!fs.existsSync(folder)){
                        mkdirp.sync(folder);
                    }
                    const filePath = `${folder}/${item.file}`;
                    console.log(`writing file: ${filePath}`);
                    fs.writeFileSync(filePath, res.text);
                    const byteSize = Buffer.byteLength(res.text, 'utf8')/ 1024;
                    const gzipSize = Buffer.byteLength(zlib.gzipSync(res.text, { level }), 'utf8') / 1024;
                    resolve({
                        name: item.name,
                        version: item.version,
                        file: item.file,
                        url,
                        byteSize,
                        gzipSize,
                        gzipLevel: level,
                        gzipRatio: gzipSize / byteSize,
                    });
                } else {
                    reject(res.status);
                }
            });
    });
};

const fetchCdnFiles = (cdnFiles) => {
    return new Promise((resolve, reject) => {
        const promiseArr = [];
        cdnFiles.forEach(item => {
            const promise = fetch(item);
            promiseArr.push(promise);
        });
        Promise
            .all(promiseArr)
            .then(resultArr => {
                let totalByteSize = 0;
                let totalGzipSize = 0;
                resultArr.forEach(item => {
                    totalByteSize += item.byteSize;
                    totalGzipSize += item.gzipSize;
                });
                let totalGzipRatio = totalByteSize / totalGzipSize;
                resolve({
                    totalByteSize,
                    totalGzipSize,
                    totalGzipRatio,
                    files: resultArr,
                });
            });
    });
};

module.exports = {
    fetch,
    fetchCdnFiles,
};


