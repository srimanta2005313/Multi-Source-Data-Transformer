import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function test() {
  try {
    const dummyBuffer = Buffer.from('%PDF-1.5 ...'); // not a valid PDF but let's see if it parses or throws
    console.log("Instantiating PDFParse...");
    const parser = new PDFParse({ data: dummyBuffer });
    console.log("Calling getText...");
    const parsedPdf = await parser.getText();
    console.log("Text length:", parsedPdf.text.length);
    await parser.destroy();
  } catch (err) {
    console.error("Caught error:", err);
  }
}

test();
