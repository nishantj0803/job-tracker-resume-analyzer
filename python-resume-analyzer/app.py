# File: python-resume-analyzer/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from . import resume_analyzer 
import os

app = Flask(__name__)
CORS(app) 

@app.route('/analyze_resume', methods=['POST'])
def analyze_resume_route():
    app.logger.info(f"PYTHON_FLASK_LOG: --- New /analyze_resume request ---")
    
    if 'resume' not in request.files:
        app.logger.error("PYTHON_FLASK_ERROR: No 'resume' file part in request.files.")
        return jsonify({"error": "No resume file part in the request (Flask backend)."}), 400
    
    file = request.files['resume']
    
    if file.filename == '':
        app.logger.error("PYTHON_FLASK_ERROR: No file selected (empty filename).")
        return jsonify({"error": "No file selected (Flask backend)."}), 400
    
    if file:
        try:
            app.logger.info(f"PYTHON_FLASK_LOG: Processing file: {file.filename}")
            
            extracted_text = resume_analyzer.extract_text_from_pdf(file.stream)
            
            if not extracted_text.strip():
                 app.logger.warning(f"PYTHON_FLASK_WARNING: Could not extract text from PDF: {file.filename}")
                 return jsonify({"error": "Could not extract text from the PDF. The PDF might be image-based or password-protected."}), 400

            analysis_result = resume_analyzer.analyze_resume_text(extracted_text)
            app.logger.info(f"PYTHON_FLASK_LOG: Analysis successful for {file.filename}")
            return jsonify(analysis_result), 200
            
        except Exception as e:
            app.logger.error(f"PYTHON_FLASK_ERROR: Error processing resume '{file.filename}': {e}", exc_info=True)
            if "PdfReadError" in str(type(e).__name__) or "EOF marker not found" in str(e):
                 return jsonify({"error": "Failed to read PDF. It might be corrupted or not a valid PDF."}), 400
            return jsonify({"error": f"An unexpected error occurred during analysis: {str(e)}"}), 500
            
    return jsonify({"error": "An unknown error occurred while processing the file."}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
