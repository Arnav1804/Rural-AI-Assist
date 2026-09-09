import os
import sys
from fastapi.testclient import TestClient
from main import app

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)
FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "tests", "fixtures", "sample_plant.png")

def test_multimodal_plant_diagnosis():
    print("=" * 60)
    print("TEST 1: Multimodal Plant Diagnosis ('What is wrong with this plant?' + photo)")
    print(f"Fixture: {FIXTURE_PATH}")
    print("=" * 60)

    assert os.path.exists(FIXTURE_PATH), f"Fixture not found at {FIXTURE_PATH}"

    with open(FIXTURE_PATH, "rb") as img_file:
        files = {"image": ("sample_plant.png", img_file, "image/png")}
        data = {"message": "What is wrong with this plant leaf?"}
        res = client.post("/chat", data=data, files=files)

    print(f"Status Code: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"

    json_res = res.json()
    route = json_res.get("route", [])
    response = json_res.get("response", "")

    print(f"Route:    {route}")
    print(f"Response:\n{response}\n")

    assert "agriculture" in route, f"Expected 'agriculture' in route, got {route}"

    # Verify safety hedging and local expert advice
    response_lower = response.lower()
    has_hedging_or_expert = any(
        term in response_lower
        for term in ["expert", "kvk", "extension", "officer", "inspect", "certainty", "photo", "confirm", "local"]
    )
    assert has_hedging_or_expert, "Safety guardrail missing: response must hedge certainty and recommend local expert/KVK"
    print("[PASS] Multimodal plant diagnosis passed with safety hedging and local expert advice.\n")


def test_text_only_regression():
    print("=" * 60)
    print("TEST 2: Text-only Backward Compatibility (JSON /chat)")
    print("=" * 60)

    res = client.post("/chat", json={"message": "What is the NPK ratio for cereals?"})
    print(f"Status Code: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"

    json_res = res.json()
    print(f"Route:    {json_res.get('route')}")
    print(f"Response: {json_res.get('response')[:120]}...\n")
    assert "agriculture" in json_res.get("route", [])
    assert "4:2:1" in json_res.get("response", "")
    print("[PASS] Text-only requests operate cleanly without regression.\n")


def test_invalid_file_type():
    print("=" * 60)
    print("TEST 3: File Type Validation (Reject non-image files)")
    print("=" * 60)

    files = {"image": ("document.txt", b"dummy text content", "text/plain")}
    data = {"message": "Check this file"}
    res = client.post("/chat", data=data, files=files)

    print(f"Status Code: {res.status_code} (Expected: 400)")
    print(f"Response:    {res.json()}")
    assert res.status_code == 400
    assert "Only JPG and PNG" in res.json().get("detail", "")
    print("[PASS] Invalid file types rejected with HTTP 400.\n")


def test_file_size_limit():
    print("=" * 60)
    print("TEST 4: File Size Validation (Reject > 5MB)")
    print("=" * 60)

    oversized_data = b"0" * (5 * 1024 * 1024 + 1024)  # 5MB + 1KB
    files = {"image": ("huge.png", oversized_data, "image/png")}
    data = {"message": "Check this large file"}
    res = client.post("/chat", data=data, files=files)

    print(f"Status Code: {res.status_code} (Expected: 400)")
    print(f"Response:    {res.json()}")
    assert res.status_code == 400
    assert "5MB" in res.json().get("detail", "")
    print("[PASS] Files exceeding 5MB rejected with HTTP 400.\n")


if __name__ == "__main__":
    test_multimodal_plant_diagnosis()
    test_text_only_regression()
    test_invalid_file_type()
    test_file_size_limit()
    print("ALL MULTIMODAL & VALIDATION TESTS PASSED SUCCESSFULLY!")
