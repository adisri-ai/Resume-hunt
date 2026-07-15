"""
This model defines all the pydantic objects(schemas) needed in the backend 
"""
from typing import List, Set
from pydantic import BaseModel, Field


class JDExtractionOutput(BaseModel):
    skills: List[str] = Field(
        ...,
        min_length=10,
        max_length=10
    )


class SkillScore(BaseModel):
    name: str
    score: float


class CVScoreOutput(BaseModel):
    skills: List[SkillScore]
    total_score: float


class ResumeResult(BaseModel):
    cv_name: str
    scores: List[float]
    total_score: float


class ProcessingStatus(BaseModel):
    processed: int = 0
    total: int = 0


class CurrentSession(BaseModel):

    jd_name: str = ""

    skills: List[str] = Field(default_factory=list)

    results: List[ResumeResult] = Field(default_factory=list)

    processed_files : Set[str] = Field(default_factory=set)
    status: ProcessingStatus = Field(
        default_factory=ProcessingStatus
    )
