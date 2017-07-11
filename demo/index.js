const { table } = require('table');
const cdnFilesBefore = require('./input.before.json');
const cdnFilesAfter = require('./input.after.json');
const cdnFileCompare = require('../');

const before = cdnFileCompare.fetchCdnFiles(cdnFilesBefore);
const after = cdnFileCompare.fetchCdnFiles(cdnFilesAfter);
Promise
    .all([before, after])
    .then(resultArr => {
        const beforeResult = resultArr[0];
        const afterResult = resultArr[1];
        const beforeResultTotalByteSize = `${beforeResult.totalByteSize.toFixed(2)}KB`;
        const afterResultTotalByteSize = `${afterResult.totalByteSize.toFixed(2)}KB`;
        const beforeResultTotalGzipSize = `${beforeResult.totalGzipSize.toFixed(2)}KB`;
        const afterResultTotalGzipSize = `${afterResult.totalGzipSize.toFixed(2)}KB`;
        const tableHead = [
            '依赖库', '版本号', '文件名', '大小', '大小(gzip)',
        ];
        resultArr.forEach((item, index) => {
            const data = [tableHead];
            item.files.forEach((file) => {
                data.push([
                    file.name,
                    file.version,
                    file.file,
                    `${file.byteSize.toFixed(2)}KB`,
                    `${file.gzipSize.toFixed(2)}KB`,
                ])
            });
            data.push([
                '-',
                '-',
                '-',
                `${resultArr[index].totalByteSize.toFixed(2)}KB`,
                `\x1B[32m${resultArr[index].totalGzipSize.toFixed(2)}KB\x1B[39m`,
            ]);
            console.log(table(data));
        });
        const deltaByteSize = beforeResult.totalByteSize - afterResult.totalByteSize;
        const deltaGzipSize = beforeResult.totalGzipSize - afterResult.totalGzipSize;
        console.log(table([
            [
                '优化前', '优化后', '优化量', '优化前(gzip)', '优化后(gzip)', '优化量(gzip)',
            ],
            [
                beforeResultTotalByteSize,
                afterResultTotalByteSize,
                `\x1B[32m ${deltaByteSize.toFixed(2)}KB (${(((deltaByteSize) / beforeResult.totalByteSize) * 100).toFixed(2)}%)\x1B[39m`,
                beforeResultTotalGzipSize,
                afterResultTotalGzipSize,
                `\x1B[32m ${deltaGzipSize.toFixed(2)}KB (${(((deltaGzipSize) / beforeResult.totalGzipSize) * 100).toFixed(2)}%)\x1B[39m`,
            ]
        ]));
    });
