import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker using CDN to ensure fast & reliable browser loading
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Extracts text from a File object or URL depending on its extension/type
 * Supports: Image (OCR), Word (.docx), Excel (.xlsx/.csv), PowerPoint (.pptx), PDF (.pdf), TXT
 */
export async function extractTextFromFile(fileOrUrl, fileName = '', onProgress = () => {}) {
  const name = typeof fileOrUrl === 'string' ? fileName : fileOrUrl.name || fileName;
  const ext = name.split('.').pop()?.toLowerCase() || '';

  // 1. IMAGE OCR (JPG, PNG, WEBP, GIF, BMP)
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext) || (typeof fileOrUrl !== 'string' && fileOrUrl.type?.startsWith('image/'))) {
    onProgress('Scanning image text with AI OCR...');
    const result = await Tesseract.recognize(fileOrUrl, 'eng+ind', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          onProgress(`Scanning image text (${pct}%)...`);
        }
      }
    });
    return result.data?.text?.trim() || '(No text detected in image)';
  }

  // Handle Binary Files (PDF, Word, Excel, PPTX, TXT)
  if (typeof fileOrUrl === 'string') {
    // If it's a URL, fetch it as Blob/ArrayBuffer first
    onProgress('Downloading file for analysis...');
    const res = await fetch(fileOrUrl);
    const blob = await res.blob();
    fileOrUrl = new File([blob], fileName, { type: blob.type });
  }

  const arrayBuffer = await fileOrUrl.arrayBuffer();

  // 2. WORD DOCUMENT (.docx)
  if (ext === 'docx') {
    onProgress('Reading Word document...');
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value?.trim() || '(Empty Word document)';
  }

  // 3. EXCEL SPREADSHEET (.xlsx, .xls, .csv)
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    onProgress('Reading Excel spreadsheet...');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let fullText = '';
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      if (csvData.trim()) {
        fullText += `--- 📊 Sheet: ${sheetName} ---\n${csvData.trim()}\n\n`;
      }
    });
    return fullText.trim() || '(Empty Excel spreadsheet)';
  }

  // 4. POWERPOINT PRESENTATION (.pptx)
  if (ext === 'pptx') {
    onProgress('Reading PowerPoint slides...');
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));
    
    // Sort slide files numerically (slide1, slide2, slide10...)
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

    let slidesText = '';
    for (let i = 0; i < slideFiles.length; i++) {
      const xmlContent = await zip.files[slideFiles[i]].async('text');
      // Extract text content inside <a:t> tags
      const textMatches = [...xmlContent.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)].map(m => m[1]);
      if (textMatches.length > 0) {
        slidesText += `--- 🖼️ Slide ${i + 1} ---\n${textMatches.join(' ')}\n\n`;
      }
    }
    return slidesText.trim() || '(Empty PowerPoint slides)';
  }

  // 5. PDF DOCUMENT (.pdf)
  if (ext === 'pdf') {
    onProgress('Reading PDF document...');
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let pdfText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        onProgress(`Reading PDF page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const tokenized = await page.getTextContent();
        const pageText = tokenized.items.map(item => item.str).join(' ');
        if (pageText.trim()) {
          pdfText += `--- 📑 Page ${i} ---\n${pageText.trim()}\n\n`;
        }
      }
      return pdfText.trim() || '(PDF has no selectable text - may contain scanned images)';
    } catch (err) {
      console.error('PDF parsing error:', err);
      return '(Could not extract text from PDF)';
    }
  }

  // 6. PLAIN TEXT / CODE (.txt, .md, .js, .json, etc.)
  onProgress('Reading text file...');
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(arrayBuffer).trim();
}
