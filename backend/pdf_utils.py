"""
This module consists of functions that can be used to perform various porcessing tasks on a PDF
"""
import io

import PyPDF2


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts all text from a PDF.

    Parameters
    ----------
    pdf_bytes : bytes
        Raw PDF bytes.

    Returns
    -------
    str
        Extracted text.
    """

    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages).strip()

    except Exception as e:
        raise RuntimeError(f"Unable to read PDF: {e}")
