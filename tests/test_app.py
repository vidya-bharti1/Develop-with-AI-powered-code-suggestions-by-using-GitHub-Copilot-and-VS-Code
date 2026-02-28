import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_activities():
    # Reset activities before each test for isolation
    for activity in activities.values():
        activity["participants"] = activity["participants"][:2] if len(activity["participants"]) > 2 else list(activity["participants"])


def test_list_activities():
    # Arrange
    # (No setup needed for listing)

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]


def test_signup_success():
    # Arrange
    email = "newstudent@mergington.edu"
    activity = "Chess Club"

    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 200
    assert email in activities[activity]["participants"]


def test_signup_duplicate():
    # Arrange
    activity = "Chess Club"
    email = activities[activity]["participants"][0]

    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 400


def test_signup_invalid_activity():
    # Arrange
    invalid_activity = "Nonexistent"
    email = "test@mergington.edu"

    # Act
    response = client.post(f"/activities/{invalid_activity}/signup?email={email}")

    # Assert
    assert response.status_code == 404


def test_unreg_success():
    # Arrange
    activity = "Chess Club"
    email = activities[activity]["participants"][0]

    # Act
    response = client.post(f"/activities/{activity}/unregister?email={email}")

    # Assert
    assert response.status_code == 200
    assert email not in activities[activity]["participants"]


def test_unreg_invalid_activity():
    # Arrange
    invalid_activity = "Nonexistent"
    email = "test@mergington.edu"

    # Act
    response = client.post(f"/activities/{invalid_activity}/unregister?email={email}")

    # Assert
    assert response.status_code == 404


def test_unreg_invalid_participant():
    # Arrange
    activity = "Chess Club"
    email = "notfound@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity}/unregister?email={email}")

    # Assert
    assert response.status_code == 404
