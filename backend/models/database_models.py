from typing import List
from pydantic import BaseModel, Field
from datetime import datetime
class ResumeResultDB(BaseModel):

    cv_name: str

    scores: List[float]

    total_score: float
class UserSessionDB(BaseModel):

    jd_name: str = ""

    skills: List[str] = Field(default_factory=list)

    results: List[ResumeResultDB] = Field(default_factory=list)

    processed_files: List[str] = Field(default_factory=list)
class RefreshTokenDB(BaseModel):

    token: str

    created_at: datetime

    expires_at: datetime