from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.auth.passwords import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user. Passwords are encrypted with bcrypt before storage.
    """
    normalized_email = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    # Hash the password
    password_hash = hash_password(user_in.password)

    user = User(
        name=user_in.name.strip(),
        email=normalized_email,
        password_hash=password_hash
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        created_at=user.created_at,
        has_profile=False
    )

    return Token(access_token=access_token, token_type="bearer", user=user_response)


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user and returns a JWT access token.
    """
    normalized_email = login_in.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    has_profile = user.financial_profile is not None

    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        created_at=user.created_at,
        has_profile=has_profile
    )

    return Token(access_token=access_token, token_type="bearer", user=user_response)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated user details.
    """
    has_profile = current_user.financial_profile is not None
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        created_at=current_user.created_at,
        has_profile=has_profile
    )
