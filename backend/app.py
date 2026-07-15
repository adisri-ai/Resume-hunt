import io
import os
import zipfile
import logging
from io import BytesIO

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from openpyxl import Workbook

from current_session import current_session
from pdf_utils import extract_text_from_pdf
from llm import (
    extract_skills_from_jd,
)
from file_processing import process_cv



load_dotenv()

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Resume Shortlisting API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.post("/upload_jd")
async def upload_jd(
    file: UploadFile = File(... , description="The pdf format of Job Description")
):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF Job Descriptions are supported."
        )

    pdf_bytes = await file.read()

    jd_text = extract_text_from_pdf(pdf_bytes)

    if not jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from the uploaded JD."
        )

    skills = await extract_skills_from_jd(
        jd_text
    )

    current_session.jd_name = file.filename
    current_session.skills = skills

    current_session.results.clear()

    current_session.processed_files.clear()

    current_session.status.processed = 0
    current_session.status.total = 0

    return {
        "message": "JD uploaded successfully.",
        "jdName": file.filename,
        "skills": skills
    }



@app.post("/upload_cv")
async def upload_cv(
    file: UploadFile = File(...)
):

    if len(current_session.skills) == 0:
        raise HTTPException(
            status_code=400,
            detail="Please upload a Job Description first."
        )

    filename = file.filename.lower()

    if not (
        filename.endswith(".pdf")
        or
        filename.endswith(".zip")
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and ZIP resumes are supported."
        )

    # --------------------------------------------------------------
    # ZIP Upload
    # --------------------------------------------------------------

    if filename.endswith(".zip"):

        zip_bytes = await file.read()

        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:

            pdf_files = [
                f
                for f in zf.infolist()
                if (
                    not f.is_dir()
                    and
                    f.filename.lower().endswith(".pdf")
                )
            ]

            current_session.status.total = len(pdf_files)
            current_session.status.processed = 0

            for info in pdf_files:

                if info.filename in current_session.processed_files:
                    continue

                pdf_bytes = zf.read(info)

                await process_cv(
                    info.filename,
                    pdf_bytes
                )

        return {
            "message": "ZIP processed successfully.",
            "processed": current_session.status.processed,
            "results": [
                r.model_dump()
                for r in current_session.results
            ]
        }

    if file.filename in current_session.processed_files:

        raise HTTPException(
            status_code=409,
            detail=f"{file.filename} has already been processed."
        )

    pdf_bytes = await file.read()

    current_session.status.total = 1
    current_session.status.processed = 0

    await process_cv(
        file.filename,
        pdf_bytes
    )

    return {
        "message": "Resume processed successfully.",
        "results": [
            r.model_dump()
            for r in current_session.results
        ]
    }


# ------------------------------------------------------------------
# Status
# ------------------------------------------------------------------

@app.get("/status")
def get_status():

    return current_session.status.model_dump()


# ------------------------------------------------------------------
# Results
# ------------------------------------------------------------------

@app.get("/results")
def get_results():

    sorted_results = sorted(
        current_session.results,
        key=lambda x: x.total_score,
        reverse=True
    )

    return {

        "jdName": current_session.jd_name,

        "skills": current_session.skills,

        "rows": [
            row.model_dump()
            for row in sorted_results
        ]
    }


@app.get("/download")
def download_results():

    if len(current_session.results) == 0:

        raise HTTPException(
            status_code=400,
            detail="No results available."
        )

    workbook = Workbook()

    worksheet = workbook.active

    worksheet.title = "Results"

    worksheet.append(

        ["CV Name"]

        +

        current_session.skills

        +

        ["Total Score"]

    )

    sorted_results = sorted(

        current_session.results,

        key=lambda x: x.total_score,

        reverse=True

    )

    for result in sorted_results:

        worksheet.append(

            [result.cv_name]

            +

            result.scores

            +

            [result.total_score]

        )

    stream = BytesIO()

    workbook.save(stream)

    stream.seek(0)

    return StreamingResponse(

        stream,

        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={

            "Content-Disposition":

            "attachment; filename=resume_results.xlsx"

        }

    )

@app.post("/reset")
def reset():

    current_session.jd_name = ""

    current_session.skills.clear()

    current_session.results.clear()

    current_session.processed_files.clear()

    current_session.status.processed = 0

    current_session.status.total = 0

    return {

        "message": "Session reset successfully."

    }
