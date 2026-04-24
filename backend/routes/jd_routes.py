from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.jd import JD
from backend.models.criteria import Criteria
from backend.services.llm_service import extract_criteria
from backend.services.file_parser import parse_pdf, parse_docx

router = APIRouter(prefix="/jd", tags=["JD"])


@router.post("/create")
async def create_jd(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # ✅ Read file content
    if file.filename.endswith(".pdf"):
        raw_text = parse_pdf(file.file)
    elif file.filename.endswith(".docx"):
        raw_text = parse_docx(file.file)
    else:
        return {"error": "Unsupported file format. Use PDF or DOCX."}

    # ✅ Save JD
    jd = JD(title=title, raw_text=raw_text)
    db.add(jd)
    db.commit()
    db.refresh(jd)

    # ✅ Extract criteria
    criteria_list = extract_criteria(raw_text)

    for c in criteria_list:
        db.add(Criteria(jd_id=jd.id, text=c))

    db.commit()

    return {"jd_id": jd.id, "criteria": criteria_list}