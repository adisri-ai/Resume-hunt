from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.resume import Resume
from backend.models.criteria import Criteria
from backend.models.score import Score
from backend.services.llm_service import score_resume_with_llm
from backend.services.file_parser import parse_pdf, parse_docx

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    jd_id: int = Form(...),
    candidate_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # ✅ Parse file
    if file.filename.endswith(".pdf"):
        raw_text = parse_pdf(file.file)
    elif file.filename.endswith(".docx"):
        raw_text = parse_docx(file.file)
    else:
        return {"error": "Unsupported file format. Use PDF or DOCX."}

    # ✅ Save Resume
    resume = Resume(
        jd_id=jd_id,
        candidate_name=candidate_name,
        raw_text=raw_text
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # ✅ Get criteria
    criteria = db.query(Criteria).filter(Criteria.jd_id == jd_id).all()
    criteria_texts = [c.text for c in criteria]

    # ✅ Score using LLM
    scores = score_resume_with_llm(raw_text, criteria_texts)

    # ✅ Store scores
    for c, s in zip(criteria, scores):
        db.add(
            Score(
                resume_id=resume.id,
                criterion_id=c.id,
                score=float(s)
            )
        )

    db.commit()

    return {
        "resume_id": resume.id,
        "scores": scores
    }