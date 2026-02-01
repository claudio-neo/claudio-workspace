const fs = require('fs');

// Verificar qué exporta pdf-parse
const pdfParseModule = require('pdf-parse');
console.log("Type:", typeof pdfParseModule);
console.log("Keys:", Object.keys(pdfParseModule));
