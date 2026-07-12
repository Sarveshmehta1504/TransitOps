import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_test():
    print("Starting End-to-End API Integration Verification...")
    
    # 1. Health Check
    print("\n[Step 1] GET /health")
    r = requests.get(f"{BASE_URL}/health")
    print(f"Status: {r.status_code}, Response: {r.json()}")
    assert r.status_code == 200
    
    # 2. Login
    print("\n[Step 2] POST /login")
    payload = {
        "email": "admin@transitops.com",
        "password": "password",
        "device_name": "transitops-test"
    }
    r = requests.post(f"{BASE_URL}/login", json=payload, headers={"Accept": "application/json"})
    print(f"Status: {r.status_code}")
    res_data = r.json()
    assert r.status_code == 200
    assert res_data["success"] is True
    token = res_data["token"]
    print("Login successful. Token obtained.")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    # 3. Get Current User
    print("\n[Step 3] GET /me")
    r = requests.get(f"{BASE_URL}/me", headers=headers)
    me_data = r.json()
    print(f"Status: {r.status_code}, Keys: {list(me_data.keys())}, Data: {me_data}")
    assert r.status_code == 200
    
    # 4. GET /dashboard
    print("\n[Step 4] GET /dashboard")
    r = requests.get(f"{BASE_URL}/dashboard", headers=headers)
    dash_data = r.json()
    print(f"Status: {r.status_code}, Response: {dash_data}")
    assert r.status_code == 200
    
    # 5. Create Vehicle
    print("\n[Step 5] POST /vehicles (Create Vehicle)")
    import random
    rand_suffix = random.randint(1000, 9999)
    vehicle_payload = {
        "registration_number": f"MH12AB{rand_suffix}",
        "name": "Tata Ultra Truck",
        "type": "Truck",
        "max_load_capacity": 15000,
        "odometer": 45000,
        "acquisition_cost": 2800000,
        "status": "available"
    }
    r = requests.post(f"{BASE_URL}/vehicles", json=vehicle_payload, headers=headers)
    print(f"Status: {r.status_code}, Response: {r.text}")
    assert r.status_code in [200, 201]
    vehicle = r.json()["data"]
    vehicle_id = vehicle["id"]
    print(f"Created Vehicle ID: {vehicle_id}")
    
    # 6. Create Driver
    print("\n[Step 6] POST /drivers (Create Driver)")
    driver_payload = {
        "name": "Ramesh Kumar",
        "license_number": f"DL-14-{rand_suffix}99",
        "license_expiry": "2030-12-31",
        "email": f"ramesh.kumar.{rand_suffix}@transitops.com",
        "contact_number": f"987654{rand_suffix}",
        "license_category": "Heavy",
        "address": "Delhi Depot",
        "date_of_birth": "1992-05-15",
        "joining_date": "2026-01-10",
        "safety_score": 95,
        "status": "available"
    }
    r = requests.post(f"{BASE_URL}/drivers", json=driver_payload, headers=headers)
    print(f"Status: {r.status_code}, Response: {r.text}")
    assert r.status_code in [200, 201]
    driver = r.json()["data"]
    driver_id = driver["id"]
    print(f"Created Driver ID: {driver_id}")
    
    # 7. Create Trip
    print("\n[Step 7] POST /trips (Create Trip)")
    trip_payload = {
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "trip_number": f"TRIP-{rand_suffix}",
        "source": "Mumbai Port",
        "destination": "Delhi Logistics Hub",
        "cargo_weight": 25.50,
        "planned_distance": 1400.00,
        "starting_odometer": 45000.00
    }
    r = requests.post(f"{BASE_URL}/trips", json=trip_payload, headers=headers)
    print(f"Status: {r.status_code}, Response: {r.text}")
    assert r.status_code in [200, 201]
    trip = r.json()["data"]
    trip_id = trip["id"]
    print(f"Created Trip ID: {trip_id}")
    
    # 8. Dispatch Trip
    print("\n[Step 8] POST /trips/{id}/dispatch")
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/dispatch", headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code == 200
    
    # 9. Create Fuel Log
    print("\n[Step 9] POST /fuel-logs")
    fuel_payload = {
        "vehicle_id": vehicle_id,
        "trip_id": trip_id,
        "quantity": 80,
        "price_per_liter": 95,
        "odometer_reading": 45200,
        "fuel_date": "2026-07-12 11:00:00",
        "remarks": "Highway Refuel"
    }
    r = requests.post(f"{BASE_URL}/fuel-logs", json=fuel_payload, headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code in [200, 201]
    
    # 10. Create Expense
    print("\n[Step 10] POST /expenses")
    expense_payload = {
        "vehicle_id": vehicle_id,
        "trip_id": trip_id,
        "expense_type": "toll",
        "title": "National Highway Toll",
        "amount": 950,
        "expense_date": "2026-07-12",
        "paid_by": "Driver",
        "payment_method": "cash",
        "receipt_number": "NH-TOLL-1234",
        "remarks": "Toll plaza card payment fallback"
    }
    r = requests.post(f"{BASE_URL}/expenses", json=expense_payload, headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code in [200, 201]
    
    # 11. Complete Trip
    print("\n[Step 11] POST /trips/{id}/complete")
    complete_payload = {
        "actual_distance": 605,
        "fuel_consumed": 78,
        "ending_odometer": 45605,
        "remarks": "Trip completed with minor delay due to traffic"
    }
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/complete", json=complete_payload, headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code == 200
    
    # 12. Create Maintenance
    print("\n[Step 12] POST /maintenance (Create Maintenance)")
    maint_payload = {
        "vehicle_id": vehicle_id,
        "maintenance_type": "preventive",
        "title": "Post-Trip Maintenance Check",
        "description": "Examine tyre pressure and engine oil level",
        "cost": 1200,
        "start_date": "2026-07-12",
        "status": "scheduled",
        "remarks": "Scheduled inspection"
    }
    r = requests.post(f"{BASE_URL}/maintenance", json=maint_payload, headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code in [200, 201]
    maint = r.json()["data"]
    maint_id = maint["id"]
    print(f"Created Maintenance ID: {maint_id}")
    
    # 13. Start Maintenance
    print("\n[Step 13] POST /maintenance/{id}/start")
    r = requests.post(f"{BASE_URL}/maintenance/{maint_id}/start", headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code == 200
    
    # 14. Complete Maintenance
    print("\n[Step 14] POST /maintenance/{id}/complete")
    r = requests.post(f"{BASE_URL}/maintenance/{maint_id}/complete", headers=headers)
    if r.status_code == 500:
        try:
            err = r.json()
            print(f"Status: 500, Message: {err.get('message')}, Exception: {err.get('exception')} in {err.get('file')}:{err.get('line')}")
        except Exception:
            print(f"Status: 500, Response: {r.text[:300]}")
    else:
        print(f"Status: {r.status_code}, Response: {r.text[:300]}")
    assert r.status_code == 200
    
    # 15. Test Reports
    print("\n[Step 15] Test Reports Endpoints")
    reports = ["vehicles", "drivers", "trips", "fuel", "expenses", "maintenance", "financial", "performance"]
    for report in reports:
        rep_r = requests.get(f"{BASE_URL}/reports/{report}", headers=headers)
        print(f"Report '{report}' -> Status: {rep_r.status_code}")
        assert rep_r.status_code == 200
        
    print("\n🎉 Congratulations! All 15 End-to-End API Steps passed successfully!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"\n❌ Test Failed: {e}", file=sys.stderr)
        sys.exit(1)
