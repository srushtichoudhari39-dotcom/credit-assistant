from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 characters)")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    has_profile: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: int
    email: str
