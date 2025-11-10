from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="IQX Professionals Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    user_type: str  # professional, company, supplier
    full_name: str
    phone: str
    location: str = "Bogotá"
    profile_image: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Professional(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    specialties: List[str] = []
    experience_years: int
    bio: str = ""
    education: str = ""
    certifications: List[str] = []
    average_rating: float = 0.0
    total_reviews: int = 0
    hourly_rate: Optional[float] = None
    availability_status: str = "available"  # available, busy, unavailable
    skills: List[str] = []
    areas_of_expertise: List[str] = []  # ortopedia, columna, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    company_type: str  # hospital, clinic, medical_center
    description: str = ""
    size: str = ""  # small, medium, large
    services_offered: List[str] = []
    requirements: List[str] = []
    average_rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Supplier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    products_services: List[str] = []
    description: str = ""
    certifications: List[str] = []
    average_rating: float = 0.0
    total_reviews: int = 0
    quality_score: float = 0.0
    reliability_score: float = 0.0
    competitiveness_score: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    user_type: str  # professional, company, supplier
    full_name: str
    phone: str
    location: str = "Bogotá"

class ProfessionalCreate(UserCreate):
    specialties: List[str] = []
    experience_years: int
    bio: str = ""
    education: str = ""
    certifications: List[str] = []
    hourly_rate: Optional[float] = None
    skills: List[str] = []
    areas_of_expertise: List[str] = []

class CompanyCreate(UserCreate):
    company_name: str
    company_type: str
    description: str = ""
    size: str = ""
    services_offered: List[str] = []
    requirements: List[str] = []

class SupplierCreate(UserCreate):
    company_name: str
    products_services: List[str] = []
    description: str = ""
    certifications: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reviewed_user_id: str  # ID of user being reviewed
    reviewer_user_id: str  # ID of user giving review
    reviewer_name: str
    reviewer_type: str  # professional, company, supplier
    rating: int = Field(ge=1, le=5)
    comment: str
    collaboration_type: Optional[str] = None  # surgery, consultation, supply, etc.
    date_of_service: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    reviewed_user_id: str
    reviewer_user_id: str
    reviewer_name: str
    reviewer_type: str
    rating: int = Field(ge=1, le=5)
    comment: str
    collaboration_type: Optional[str] = None
    date_of_service: Optional[datetime] = None

class MatchRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requester_user_id: str  # Company requesting professionals
    specialty_needed: str
    procedure_type: str
    description: str
    location: str
    urgency_level: str = "medium"  # low, medium, high
    budget_range: Optional[str] = None
    requirements: List[str] = []
    status: str = "open"  # open, in_progress, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deadline: Optional[datetime] = None

class MatchRequestCreate(BaseModel):
    specialty_needed: str
    procedure_type: str
    description: str
    location: str
    urgency_level: str = "medium"
    budget_range: Optional[str] = None
    requirements: List[str] = []
    deadline: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
    profile: Optional[dict] = None  # Professional, Company, or Supplier profile

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Helper functions
def verify_password(plain_password, hashed_password):
    # Simple SHA256 hashing with salt
    salted_password = plain_password + SECRET_KEY
    return hashlib.sha256(salted_password.encode()).hexdigest() == hashed_password

def get_password_hash(password):
    # Simple SHA256 hashing with salt
    salted_password = password + SECRET_KEY
    return hashlib.sha256(salted_password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Remove hashed_password from response
    user_data = user.copy()
    del user_data["hashed_password"]
    return User(**user_data)

# Calculate average rating for a user
async def update_user_ratings(user_id: str):
    reviews = await db.reviews.find({"reviewed_user_id": user_id}).to_list(1000)
    if reviews:
        total_rating = sum(review["rating"] for review in reviews)
        average_rating = total_rating / len(reviews)
        
        # Update in professionals collection if it's a professional
        await db.professionals.update_one(
            {"user_id": user_id},
            {"$set": {
                "average_rating": round(average_rating, 1),
                "total_reviews": len(reviews)
            }}
        )
        
        # Also update companies and suppliers
        await db.companies.update_one(
            {"user_id": user_id},
            {"$set": {
                "average_rating": round(average_rating, 1),
                "total_reviews": len(reviews)
            }}
        )
        
        await db.suppliers.update_one(
            {"user_id": user_id},
            {"$set": {
                "average_rating": round(average_rating, 1),
                "total_reviews": len(reviews)
            }}
        )

# Routes
@api_router.get("/")
async def root():
    return {"message": "IQX Professionals Platform API"}

# Authentication routes
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: dict):
    email = user_data.get("email")
    password = user_data.get("password")
    user_type = user_data.get("user_type", "professional")
    
    # Check if user already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(password)
    
    # Create base user
    new_user = User(
        email=email,
        user_type=user_type,
        full_name=user_data.get("full_name", ""),
        phone=user_data.get("phone", ""),
        location=user_data.get("location", "Bogotá")
    )
    
    # Store user in database with hashed password
    user_dict = new_user.dict()
    user_dict["hashed_password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create specific profile based on user type
    profile = None
    if user_type == "professional":
        profile_data = {
            "user_id": new_user.id,
            "specialties": user_data.get("specialties", []),
            "experience_years": user_data.get("experience_years", 0),
            "bio": user_data.get("bio", ""),
            "education": user_data.get("education", ""),
            "certifications": user_data.get("certifications", []),
            "hourly_rate": user_data.get("hourly_rate"),
            "skills": user_data.get("skills", []),
            "areas_of_expertise": user_data.get("areas_of_expertise", [])
        }
        profile = Professional(**profile_data)
        await db.professionals.insert_one(profile.dict())
    
    elif user_type == "company":
        profile_data = {
            "user_id": new_user.id,
            "company_name": user_data.get("company_name", ""),
            "company_type": user_data.get("company_type", ""),
            "description": user_data.get("description", ""),
            "size": user_data.get("size", ""),
            "services_offered": user_data.get("services_offered", []),
            "requirements": user_data.get("requirements", [])
        }
        profile = Company(**profile_data)
        await db.companies.insert_one(profile.dict())
    
    elif user_type == "supplier":
        profile_data = {
            "user_id": new_user.id,
            "company_name": user_data.get("company_name", ""),
            "products_services": user_data.get("products_services", []),
            "description": user_data.get("description", ""),
            "certifications": user_data.get("certifications", [])
        }
        profile = Supplier(**profile_data)
        await db.suppliers.insert_one(profile.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
        "profile": profile.dict() if profile else None
    }

@api_router.post("/auth/login", response_model=Token)
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user profile based on type
    profile = None
    if user["user_type"] == "professional":
        profile_data = await db.professionals.find_one({"user_id": user["id"]})
        if profile_data:
            profile = Professional(**profile_data)
    elif user["user_type"] == "company":
        profile_data = await db.companies.find_one({"user_id": user["id"]})
        if profile_data:
            profile = Company(**profile_data)
    elif user["user_type"] == "supplier":
        profile_data = await db.suppliers.find_one({"user_id": user["id"]})
        if profile_data:
            profile = Supplier(**profile_data)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": login_data.email}, expires_delta=access_token_expires
    )
    
    # Remove hashed_password from response
    user_data = user.copy()
    del user_data["hashed_password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user_data),
        "profile": profile.dict() if profile else None
    }

# Professional routes
@api_router.get("/professionals")
async def get_professionals(specialty: Optional[str] = None, location: Optional[str] = None):
    # Get all professional profiles
    professional_profiles = await db.professionals.find().to_list(100)
    
    result = []
    for prof_profile in professional_profiles:
        # Get user data
        user_data = await db.users.find_one({"id": prof_profile["user_id"]})
        if user_data:
            # Remove hashed_password
            user_data = {k: v for k, v in user_data.items() if k != "hashed_password"}
            # Combine user and profile data
            combined = {**user_data, **prof_profile}
            
            # Apply filters
            if specialty and specialty not in prof_profile.get("specialties", []):
                continue
            if location and location.lower() not in user_data.get("location", "").lower():
                continue
                
            result.append(combined)
    
    return result

@api_router.get("/professionals/{professional_id}")
async def get_professional(professional_id: str):
    # First try to find by user_id in professionals collection
    professional = await db.professionals.find_one({"user_id": professional_id})
    if professional:
        # Get user data
        user_data = await db.users.find_one({"id": professional_id})
        if user_data:
            user_data = {k: v for k, v in user_data.items() if k != "hashed_password"}
            return {**user_data, **professional}
    
    # Try to find by id in professionals collection (backward compatibility)
    professional = await db.professionals.find_one({"id": professional_id})
    if professional:
        return professional
        
    raise HTTPException(status_code=404, detail="Professional not found")

@api_router.get("/professionals/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    # Get user profile based on type
    profile = None
    if current_user.user_type == "professional":
        profile_data = await db.professionals.find_one({"user_id": current_user.id})
        if profile_data:
            profile = {**current_user.dict(), **profile_data}
    elif current_user.user_type == "company":
        profile_data = await db.companies.find_one({"user_id": current_user.id})
        if profile_data:
            profile = {**current_user.dict(), **profile_data}
    elif current_user.user_type == "supplier":
        profile_data = await db.suppliers.find_one({"user_id": current_user.id})
        if profile_data:
            profile = {**current_user.dict(), **profile_data}
    
    return profile or current_user.dict()

@api_router.put("/professionals/me")
async def update_user_profile(
    update_data: dict,
    current_user: User = Depends(get_current_user)
):
    # Update timestamp
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Update user data
    user_fields = ["full_name", "phone", "location"]
    user_updates = {k: v for k, v in update_data.items() if k in user_fields}
    if user_updates:
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": user_updates}
        )
    
    # Update profile data based on user type
    if current_user.user_type == "professional":
        profile_fields = ["specialties", "experience_years", "bio", "education", "certifications", 
                         "hourly_rate", "skills", "areas_of_expertise", "availability_status"]
        profile_updates = {k: v for k, v in update_data.items() if k in profile_fields}
        if profile_updates:
            await db.professionals.update_one(
                {"user_id": current_user.id},
                {"$set": profile_updates}
            )
    
    # Get updated profile
    return await get_current_user_profile(current_user)

# Review routes
@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    # Verify user exists
    user = await db.users.find_one({"id": review.reviewed_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_review = Review(**review.dict())
    await db.reviews.insert_one(new_review.dict())
    
    # Update user's average rating
    await update_user_ratings(review.reviewed_user_id)
    
    return new_review

@api_router.get("/reviews/professional/{user_id}", response_model=List[Review])
async def get_user_reviews(user_id: str):
    reviews = await db.reviews.find({"reviewed_user_id": user_id}).sort("created_at", -1).to_list(100)
    return [Review(**review) for review in reviews]

@api_router.get("/reviews", response_model=List[Review])
async def get_all_reviews():
    reviews = await db.reviews.find().sort("created_at", -1).to_list(100)
    return [Review(**review) for review in reviews]

# Specialty routes
@api_router.get("/specialties")
async def get_specialties():
    specialties = [
        "Ortopedia",
        "Columna",
        "Traumatología",
        "Cardiología",
        "Neurología",
        "Anestesiología",
        "Cirugía General",
        "Ginecología",
        "Urología",
        "Oftalmología",
        "Otorrinolaringología",
        "Dermatología",
        "Radiología",
        "Patología",
        "Medicina Interna"
    ]
    return {"specialties": specialties}

# Status check route (keeping original for compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
