import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
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
  let arrayBuffer;
  if (typeof fileOrUrl === 'string') {
    onProgress('Downloading file for analysis...');
    const res = await fetch(fileOrUrl);
    const blob = await res.blob();
    arrayBuffer = await blob.arrayBuffer();
  } else {
    arrayBuffer = await fileOrUrl.arrayBuffer();
  }

  // 2. WORD DOCUMENT (.docx)
  if (ext === 'docx') {
    onProgress('Reading Word document...');
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value?.trim() || '(Empty Word document)';
    } catch (e) {
      return '(Could not parse Word document)';
    }
  }

  // 3. EXCEL SPREADSHEET (.xlsx, .xls, .csv)
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    onProgress('Reading Excel spreadsheet...');
    try {
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
    } catch (e) {
      return '(Could not parse Excel file)';
    }
  }

  // 4. POWERPOINT PRESENTATION (.pptx)
  if (ext === 'pptx') {
    onProgress('Reading PowerPoint slides...');
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));
      
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        return numA - numB;
      });

      let slidesText = '';
      for (let i = 0; i < slideFiles.length; i++) {
        const xmlContent = await zip.files[slideFiles[i]].async('text');
        const textMatches = [...xmlContent.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)].map(m => m[1]);
        if (textMatches.length > 0) {
          slidesText += `--- 🖼️ Slide ${i + 1} ---\n${textMatches.join(' ')}\n\n`;
        }
      }
      return slidesText.trim() || '(Empty PowerPoint slides)';
    } catch (e) {
      return '(Could not parse PowerPoint file)';
    }
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
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ').trim();

        if (pageText && pageText.length > 5) {
          pdfText += `--- 📑 Page ${i} ---\n${pageText}\n\n`;
        } else {
          // Fallback to OCR if page has no selectable text (scanned PDF image)
          onProgress(`OCR Scanning PDF page ${i}/${pdf.numPages}...`);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const ocrResult = await Tesseract.recognize(dataUrl, 'eng+ind');
          const ocrText = ocrResult.data?.text?.trim();
          if (ocrText) {
            pdfText += `--- 📑 Page ${i} (AI OCR Scan) ---\n${ocrText}\n\n`;
          }
        }
      }
      return pdfText.trim() || '(No text found in PDF)';
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
