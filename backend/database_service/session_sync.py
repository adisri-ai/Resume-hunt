from  session_service.current_session import current_session

from  models.database_models import (UserSessionDB , ResumeResultDB)
from models.app_models import ResumeResult
from  database_service.session_repository import (
    SessionRepository
)


async def sync_session_to_database(
    email: str
):

    session = UserSessionDB(

        jd_name=current_session.jd_name,

        skills=list(current_session.skills),

        results=[

            ResumeResultDB(

                cv_name=result.cv_name,

                scores=list(result.scores),

                total_score=result.total_score

            )

            for result in current_session.results

        ],

        processed_files=list(current_session.processed_files)

    )

    await SessionRepository.save_session(

        email,

        session

    )


async def load_session_from_database(
    email: str
):

    session = await SessionRepository.load_session(

        email
    )

    if session is None:

        current_session.jd_name = ""

        current_session.skills.clear()

        current_session.results.clear()

        current_session.processed_files.clear()

        current_session.status.processed = 0

        current_session.status.total = 0

        return

    current_session.jd_name = session.jd_name

    current_session.skills = list(session.skills)

    current_session.results = [

        ResumeResult(

            cv_name=result.cv_name,

            scores=result.scores,

            total_score=result.total_score,

        )

        for result in session.results

    ]

    current_session.processed_files.clear()

    current_session.status.processed = len(session.results)

    current_session.status.total = len(session.results)


async def reset_database_session(
    email: str
):

    await SessionRepository.reset_session(

        email
    )