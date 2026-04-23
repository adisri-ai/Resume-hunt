from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.resume import Resume
from models.score import Score
from models.criteria import Criteria
import pandas as pd

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/{jd_id}")
def export_results(jd_id: int, db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.jd_id == jd_id).all()
    criteria = db.query(Criteria).filter(Criteria.jd_id == jd_id).all()

    data = []

    for r in resumes:
        row = {"Candidate": r.candidate_name}
        total = 0

        for c in criteria:
            score = db.query(Score).filter(
                Score.resume_id == r.id,
                Score.criterion_id == c.id
            ).first()

            value = score.score if score else 0
            row[c.text] = value
            total += value

        row["Total"] = round(total, 2)
        data.append(row)

    df = pd.DataFrame(data)
    file_path = f"export_jd_{jd_id}.csv"
    df.to_csv(file_path, index=False)

    return {"file": file_path}