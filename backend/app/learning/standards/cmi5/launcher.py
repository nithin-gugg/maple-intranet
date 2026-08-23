import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.learning import LearningAttempt, Cmi5Registration, Cmi5Session, Cmi5AssignableUnit
from fastapi import HTTPException

class Cmi5Launcher:
    """
    Handles the establishment of CMI5 registrations and sessions for launching an AU.
    """
    
    @staticmethod
    async def get_or_create_registration(db: AsyncSession, attempt_id: int) -> Cmi5Registration:
        """
        Retrieves the CMI5 registration associated with an attempt, or creates one.
        """
        result = await db.execute(
            select(Cmi5Registration).where(Cmi5Registration.attempt_id == attempt_id)
        )
        registration = result.scalars().first()
        
        if not registration:
            registration = Cmi5Registration(
                attempt_id=attempt_id,
                registration_id=str(uuid.uuid4())
            )
            db.add(registration)
            await db.commit()
            await db.refresh(registration)
            
        return registration

    @staticmethod
    async def create_session(db: AsyncSession, registration_id: str, au_id: str) -> Cmi5Session:
        """
        Creates a new active CMI5 session with a unique session_id and auth_token.
        """
        # Invalidate any existing active sessions for this registration and AU
        # to ensure the learner only has one active session for this AU.
        active_sessions = await db.execute(
            select(Cmi5Session)
            .where(Cmi5Session.registration_id == registration_id)
            .where(Cmi5Session.au_id == au_id)
            .where(Cmi5Session.is_active == True)
        )
        for s in active_sessions.scalars().all():
            s.is_active = False
            
        new_session = Cmi5Session(
            registration_id=registration_id,
            session_id=str(uuid.uuid4()),
            au_id=au_id,
            auth_token=str(uuid.uuid4()), # Generate a secure token
            is_active=True
        )
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)
        
        return new_session

    @staticmethod
    async def get_au_metadata(db: AsyncSession, package_id: int) -> Cmi5AssignableUnit:
        """
        Retrieves the primary AU for the given package. 
        Provides a fallback AU for packages uploaded before the CMI5 Engine update.
        """
        result = await db.execute(
            select(Cmi5AssignableUnit).where(Cmi5AssignableUnit.package_id == package_id).order_by(Cmi5AssignableUnit.id)
        )
        au = result.scalars().first()
        if not au:
            # Fallback for packages uploaded before the cmi5 tables existed
            # We mock a generic AU so the course can still launch.
            fallback_au = Cmi5AssignableUnit(
                package_id=package_id,
                au_id="http://mocked-au-id-fallback",
                title="Generic AU",
                launch_method="AnyWindow",
                move_on="CompletedAndPassed",
                return_url_support=False
            )
            db.add(fallback_au)
            await db.commit()
            await db.refresh(fallback_au)
            return fallback_au
            
        return au
