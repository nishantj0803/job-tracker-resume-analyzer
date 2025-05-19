from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import nltk
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Download NLTK data
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('stopwords')
    nltk.download('punkt')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/', methods=['GET'])
def index():
    return "Resume Analyzer API is running!"

@app.route('/health', methods=['GET'])
def health_check():
    app.logger.info("Health check endpoint called")
    return jsonify({"status": "healthy"})

@app.route('/compare', methods=['POST'])
def compare_resume_job():
    app.logger.info("Compare endpoint called")
    
    try:
        from simple_resume_analyzer import SimpleResumeAnalyzer
        
        data = request.json
        app.logger.debug(f"Received data: {data}")
        
        if not data or 'resumeText' not in data or 'jobDescription' not in data:
            app.logger.error("Missing required fields in request")
            return jsonify({"error": "Missing resume text or job description"}), 400
        
        resume_text = data['resumeText']
        job_description = data['jobDescription']
        
        try:
            analyzer = SimpleResumeAnalyzer()
            result = analyzer.calculate_keyword_match(resume_text, job_description)
            app.logger.info("Successfully processed comparison")
            return jsonify(result)
        except Exception as e:
            app.logger.error(f"Error in analyzer: {str(e)}")
            return jsonify({"error": str(e)}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
