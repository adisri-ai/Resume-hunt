from fastapi import FastAPI
from database import Base, engine
from routes import jd_routes, resume_routes, export
Base.metadata.create_all(bind=engine)
app = FastAPI(title="AI Job Shortlisting System")
app.include_router(jd_routes.router)
app.include_router(resume_routes.router)
app.include_router(export.router)
@app.get("/")
def root():
    return {"message": "AI Job Shortlisting Backend Running"}
