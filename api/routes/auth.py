from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from auth import hash_password, verify_password, create_access_token, revoke_session, get_token_payload, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/setup")
def setup_status(db: Session = Depends(get_db)):
    """Public endpoint — returns whether the initial admin account still needs to be created."""
    return {"setup_required": db.query(User).count() == 0}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    is_first_user = db.query(User).count() == 0
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        display_name=body.display_name or None,
        is_admin=is_first_user,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/logout")
def logout(payload: dict = Depends(get_token_payload)):
    revoke_session(payload["session_id"])
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user
