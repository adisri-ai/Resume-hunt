"""
This module performs the task of processing the 
uploaded resume/cv and extracting grades from it based on the current jd.
"""
from pdf_utils import extract_text_from_pdf
from llm import score_cv_against_skills
from current_session import current_session
from models import ResumeResult
async def process_cv(filename : str ,pdf_bytes: str):
    cv_text = extract_text_from_pdf(pdf_bytes)
    scores, total = score_cv_against_skills(

        cv_text,

        current_session.skills
    )
    result = result = ResumeResult(
        cv_name=filename,
        scores=scores,
        total_score=total
    )

    current_session.results.append(result)
    current_session.processed_files.add(filename)
    current_session.status.processed += 1

    current_session.status.total += 1
    return {

        "message": "CV processed successfully.",

        "results": [result.model_dump() for result in current_session.results]
    }
