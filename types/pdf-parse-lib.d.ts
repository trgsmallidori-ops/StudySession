declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PDFPageProxy {
    getTextContent: () => Promise<{
      items: Array<{
        str: string;
        transform: number[];
      }>;
    }>;
  }

  interface PDFParseOptions {
    pagerender?: (pageData: PDFPageProxy) => Promise<string>;
  }

  interface PDFParseResult {
    text: string;
  }

  export default function pdfParse(dataBuffer: Buffer, options?: PDFParseOptions): Promise<PDFParseResult>;
}
