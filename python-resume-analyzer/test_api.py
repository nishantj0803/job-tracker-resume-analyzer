import requests
import json

def test_health():
    response = requests.get('http://localhost:5000/health')
    print(f"Health check status code: {response.status_code}")
    print(f"Response: {response.json()}")

def test_compare():
    data = {
        "resumeText": "Experienced Python developer with skills in Flask, Django, and machine learning.",
        "jobDescription": "Looking for a Python developer with experience in Flask and machine learning."
    }
    response = requests.post('http://localhost:5000/compare', json=data)
    print(f"Compare status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("Testing the API...")
    test_health()
    print("\n")
    test_compare()
