# File: python-resume-analyzer/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from . import resume_analyzer
import os

app = Flask(__name__)
CORS(app) 
@app.route('/api/<path:path>', methods=['POST', 'GET'])
def all_routes(path):
    if path == 'analyze_resume' and request.method == 'POST':
        return analyze_resume_route()
    # If the path is not found, return a 404
    return jsonify({"error": "Endpoint not found"}), 404

def analyze_resume_route():
    app.logger.info("--- analyze_resume_route triggered ---")
    if 'resume' not in request.files:
        return jsonify({"error": "No 'resume' file part in request."}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No file selected."}), 400
    
    try:
        extracted_text = resume_analyzer.extract_text_from_pdf(file.stream)
        if not extracted_text.strip():
             return jsonify({"error": "Could not extract text from the PDF. It may be image-based."}), 400

        analysis_result = resume_analyzer.analyze_resume_text(extracted_text)
        return jsonify(analysis_result), 200
            
    except Exception as e:
        app.logger.error(f"Error processing resume: {e}", exc_info=True)
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
