from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import nltk

# Download NLTK data
nltk.download('stopwords')
nltk.download('punkt')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/compare', methods=['POST'])
def compare_resume_job():
    from simple_resume_analyzer import SimpleResumeAnalyzer
    
    data = request.json
    
    if not data or 'resumeText' not in data or 'jobDescription' not in data:
        return jsonify({"error": "Missing resume text or job description"}), 400
    
    resume_text = data['resumeText']
    job_description = data['jobDescription']
    
    try:
        analyzer = SimpleResumeAnalyzer()
        result = analyzer.calculate_keyword_match(resume_text, job_description)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server with CORS support on http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
