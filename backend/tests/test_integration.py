"""
End-to-end integration test validating Section 12 acceptance test:
1. Caregiver registers and logs in.
2. Caregiver creates a patient.
3. Caregiver adds a medicine and schedule.
4. On-demand dose generation generates today's doses in Asia/Kolkata.
5. Patient accesses today's view using token without password.
6. Patient taps Taken.
7. Caregiver verifies updated status is Taken.
8. Patient taps Skipped on second dose.
9. Dose history records both events with timestamps.
10. Caregiver cannot access another caregiver's patient (authorization check).
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.timezone import today_kolkata, to_utc_datetime


@pytest.mark.asyncio
async def test_full_acceptance_workflow(monkeypatch):
    # Keep the scheduled 08:00 dose pending regardless of the CI runner's clock.
    monkeypatch.setattr(
        "app.services.dose_service.now_utc",
        lambda: to_utc_datetime(today_kolkata(), "07:59"),
    )
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Caregiver registration
        unique_email = f"caregiver_{int(pytest.importorskip('time').time())}@example.com"
        reg_res = await client.post(
            "/api/auth/register",
            json={"name": "Rohit Sharma", "email": unique_email, "password": "SecurePassword123!"},
        )
        assert reg_res.status_code == 201, reg_res.text
        caregiver_data = reg_res.json()
        assert caregiver_data["email"] == unique_email

        # 2. Caregiver creates a patient
        patient_res = await client.post(
            "/api/patients",
            json={"name": "Dadi Ji", "age": 75, "preferred_language": "hi", "notes": "BP medicine morning and evening"},
        )
        assert patient_res.status_code == 201, patient_res.text
        patient = patient_res.json()
        patient_id = patient["id"]
        token = patient["access_token"]
        assert token is not None

        # 3. Caregiver adds medicine with schedule
        med_res = await client.post(
            f"/api/patients/{patient_id}/medications",
            json={
                "name": "Amlodipine",
                "strength": "5mg",
                "dosage_instructions": "1 गोली",
                "purpose": "Blood Pressure",
                "schedule": {
                    "times": ["08:00", "20:00"],
                    "food_instruction": "after_food",
                    "start_date": "2026-01-01",
                    "active": True,
                },
            },
        )
        assert med_res.status_code == 201, med_res.text
        med = med_res.json()
        assert med["name"] == "Amlodipine"

        # 4. Caregiver checks doses for today (triggers on-demand dose generation)
        doses_res = await client.get(f"/api/patients/{patient_id}/doses")
        assert doses_res.status_code == 200, doses_res.text
        doses = doses_res.json()
        assert len(doses) >= 2, "Expected 2 doses for the schedule times"
        dose1 = doses[0]
        dose2 = doses[1]
        assert dose1["status"] == "pending"

        # 5. Patient accesses today's view using only the access_token (No login)
        patient_view_res = await client.get(f"/api/p/{token}/today")
        assert patient_view_res.status_code == 200, patient_view_res.text
        patient_today = patient_view_res.json()
        assert patient_today["patient"]["name"] == "Dadi Ji"
        assert len(patient_today["doses"]) >= 2

        # 6. Patient taps Taken on first dose
        run_id = int(pytest.importorskip('time').time() * 1000)
        taken_res = await client.post(
            f"/api/p/{token}/doses/{dose1['id']}/taken",
            json={"client_event_id": f"test_evt_1_{run_id}"},
        )
        assert taken_res.status_code == 200, taken_res.text
        assert taken_res.json()["status"] == "taken"
        assert taken_res.json()["acted_by"] == "patient"

        # 7. Caregiver verifies updated status is taken
        caregiver_check = await client.get(f"/api/patients/{patient_id}/doses")
        assert caregiver_check.status_code == 200
        updated_dose1 = next(d for d in caregiver_check.json() if d["id"] == dose1["id"])
        assert updated_dose1["status"] == "taken"

        # 8. Patient taps Skipped on second dose
        skipped_res = await client.post(
            f"/api/p/{token}/doses/{dose2['id']}/skipped",
            json={"client_event_id": f"test_evt_2_{run_id}"},
        )
        assert skipped_res.status_code == 200
        assert skipped_res.json()["status"] == "skipped"

        # 9. Dose history shows both events
        history_res = await client.get(f"/api/patients/{patient_id}/history")
        assert history_res.status_code == 200
        history_doses = history_res.json()
        statuses = [d["status"] for d in history_doses]
        assert "taken" in statuses
        assert "skipped" in statuses

        # 10. Authorization check: caregiver 2 cannot access caregiver 1's patient
        reg2_res = await client.post(
            "/api/auth/register",
            json={"name": "Another Person", "email": f"other_{int(pytest.importorskip('time').time())}@example.com", "password": "SecurePassword123!"},
        )
        assert reg2_res.status_code == 201

        # Caregiver 2 tries to access patient_id from Caregiver 1
        unauthorized_res = await client.get(f"/api/patients/{patient_id}/doses")
        assert unauthorized_res.status_code == 404, "Caregiver 2 must not see Caregiver 1's patient"
