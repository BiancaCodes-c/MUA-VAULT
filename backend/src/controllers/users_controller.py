from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel
from typing import Optional
import hashlib
import secrets

from src.config.db import get_db


router = APIRouter()


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "artist"


class LoginRequest(BaseModel):
    email: str
    password: str


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2."""
    salt = secrets.token_hex(32)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${pwd_hash.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    try:
        demo_passwords = {
            "hash_admin_demo": "admin123",
            "hash_artist_demo": "artist123",
            "hash_artist_demo_2": "artist123",
        }

        # Seeded demo records use placeholder values in password_hash.
        if password_hash in demo_passwords:
            return password == demo_passwords[password_hash]

        if "$" not in password_hash:
            return password == password_hash
        salt, pwd_hash = password_hash.split('$')
        new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return new_hash.hex() == pwd_hash
    except:
        return False


@router.get("/")
def list_users(limit: int = Query(default=25, ge=0), offset: int = Query(default=0, ge=0)):
    """List all users with pagination (passwords not returned)."""
    db = get_db()
    
    rows = db.execute(
        """
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()
    
    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.get("/{user_id}")
def get_user(user_id: int = Path(..., gt=0)):
    """Get a specific user by ID (password not returned)."""
    db = get_db()
    
    row = db.execute(
        """
        SELECT id, name, email, role, created_at
        FROM users WHERE id = ?
        """,
        (user_id,),
    ).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    return {"data": row}


@router.post("/")
def create_user(req: CreateUserRequest):
    """Create a new user account."""
    db = get_db()
    
    # Validate name
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="name is required")
    
    # Validate email
    if not req.email or not req.email.strip():
        raise HTTPException(status_code=400, detail="email is required")
    
    # Validate password
    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="password must be at least 6 characters")
    
    # Validate role
    valid_roles = ('admin', 'artist')
    if req.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Check for duplicate email
    existing = db.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail=f"Email {req.email} already exists")
    
    try:
        # Hash the password
        password_hash = hash_password(req.password)
        
        db.execute(
            """
            INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
            """,
            (
                req.name,
                req.email,
                password_hash,
                req.role,
            ),
        )
        db.commit()
        
        # Fetch and return the created user (without password)
        result = db.execute("SELECT last_insert_rowid()").fetchone()
        user_id = result[0]
        
        user = db.execute(
            """
            SELECT id, name, email, role, created_at
            FROM users WHERE id = ?
            """,
            (user_id,),
        ).fetchone()
        
        return {"data": user, "id": user_id, "message": "User created successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")


@router.post("/{user_id}/verify-password")
def verify_user_password(user_id: int = Path(..., gt=0), password: str = ""):
    """Verify a user's password (for login flows)."""
    db = get_db()
    
    if not password:
        raise HTTPException(status_code=400, detail="password is required")
    
    row = db.execute(
        "SELECT password_hash FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    password_hash = row[0]
    is_valid = verify_password(password, password_hash)
    
    return {"user_id": user_id, "password_valid": is_valid}


@router.post("/login")
def login_user(req: LoginRequest):
    """Authenticate a user by email and password."""
    db = get_db()

    email = req.email.strip().lower()
    password = req.password

    if not email:
        raise HTTPException(status_code=400, detail="email is required")
    if not password:
        raise HTTPException(status_code=400, detail="password is required")

    row = db.execute(
        """
        SELECT id, name, email, role, password_hash
        FROM users
        WHERE lower(email) = ?
        """,
        (email,),
    ).fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "data": {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "role": row["role"],
        },
        "message": "Login successful",
    }
