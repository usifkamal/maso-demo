declare module 'pdf-parse' {
  /**
   * Minimal type definition for the `pdf-parse` library used in this project.
   * We only care that it is a callable function returning a Promise with a
   * `text` field on the result. Everything else can be `any` for now.
   */
  interface PdfParseResult {
    text?: string;
    [key: string]: any;
  }

  type PdfParseFn = (
    data: Buffer | Uint8Array,
    options?: any
  ) => Promise<PdfParseResult>;

  const pdfParse: PdfParseFn;

  export = pdfParse;
}


