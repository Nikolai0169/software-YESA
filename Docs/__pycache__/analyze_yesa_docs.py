import os, re, sys
from pathlib import Path

pdf_path = Path(r'c:\Users\joser\Downloads\entregables de yesa.pdf')
docx_path = Path(r'c:\Users\joser\OneDrive\Documents\GitHub\software-YESA\Docs\documentacion final\IEEE830 (sin terminar).docx')
print('pdf_exists', pdf_path.exists())
print('docx_exists', docx_path.exists())

# try to read pdf text using pypdf if available
try:
    import pypdf
    reader = pypdf.PdfReader(str(pdf_path))
    text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    print('PDF_TEXT_LEN', len(text))
    print(text[:4000])
except Exception as e:
    print('PDF_ERROR', repr(e))

# try to read docx text via python-docx
try:
    import docx
    doc = docx.Document(str(docx_path))
    text = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
    print('DOCX_TEXT_LEN', len(text))
    print(text[:4000])
except Exception as e:
    print('DOCX_ERROR', repr(e))
