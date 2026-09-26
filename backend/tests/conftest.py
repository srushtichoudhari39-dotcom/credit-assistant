import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# Use isolated SQLite test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_credit_assistant.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_credit_assistant.db"):
        try:
            os.remove("./test_credit_assistant.db")
        except Exception:
            pass

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def authenticated_user(client):
    """
    Helper fixture to register and log in a fresh user for tests.
    """
    user_payload = {
        "name": "Aarav Sharma",
        "email": f"aarav_{os.urandom(4).hex()}@example.com",
        "password": "SecurePassword123!"
    }
    res = client.post("/api/auth/register", json=user_payload)
    data = res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return {
        "user": data["user"],
        "token": token,
        "headers": headers,
        "credentials": user_payload
    }
