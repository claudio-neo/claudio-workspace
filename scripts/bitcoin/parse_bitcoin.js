const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const dataBuffer = fs.readFileSync('bitcoin.pdf');

PDFParse(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => console.error('Error:', err));
