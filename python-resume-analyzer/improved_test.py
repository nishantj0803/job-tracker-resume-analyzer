import requests
import json
import sys

def test_health():
    try:
        response = requests.get('http://localhost:5000/health')
        print(f"Health check status code: {response.status_code}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            try:
                print(f"JSON response: {response.json()}")
            except:
                print("Response is not valid JSON")
    except Exception as e:
        print(f"Error testing health endpoint: {e}")

def test_compare():
    try:
        data = {
            "resumeText": "Experienced Python developer with skills in Flask, Django, and machine learning.",
            "jobDescription": "Looking for a Python developer with experience in Flask and machine learning."
        }
        response = requests.post('http://localhost:5000/compare', json=data)
        print(f"Compare status code: {response.status_code}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            try:
                print(f"JSON response: {json.dumps(response.json(), indent=2)}")
            except:
                print("Response is not valid JSON")
    except Exception as e:
        print(f"Error testing compare endpoint: {e}")

if __name__ == "__main__":
    print("Testing the API...")
    test_health()
    print("\n")
    test_compare()
