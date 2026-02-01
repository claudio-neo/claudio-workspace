#!/usr/bin/env python3
import sys
from PyPDF2 import PdfReader

def read_pdf(filepath):
    reader = PdfReader(filepath)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 read_pdf.py <pdf_file>")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    content = read_pdf(pdf_file)
    print(content)
