# File: python-resume-analyzer/app.py
# Description: Flask server to expose the resume analysis API. (With Request Header Logging)

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from resume_analyzer import SimpleResumeAnalyzer

app = Flask(__name__)
# Configure CORS to allow requests from any domain (you can restrict this later)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize the resume analyzer
resume_analyzer = SimpleResumeAnalyzer()

@app.route('/analyze', methods=['POST'])
def analyze_resume_route():
    # Log all received headers
    app.logger.info("PYTHON_FLASK_LOG: Headers received: %s", dict(request.headers))
    
    if 'file' not in request.files:
        app.logger.warning("PYTHON_FLASK_WARNING: No file part in request")
        return jsonify({"error": "No file part in request"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        app.logger.warning("PYTHON_FLASK_WARNING: No selected file")
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        try:
            app.logger.info(f"PYTHON_FLASK_LOG: Processing file: {file.filename}, original mimetype from Flask: {file.mimetype}")
            
            extracted_text = resume_analyzer.extract_text_from_pdf(file.stream)
            
            if not extracted_text.strip():
                 app.logger.warning(f"PYTHON_FLASK_WARNING: Could not extract text from PDF: {file.filename}")
                 return jsonify({"error": "Could not extract text from the PDF (Flask backend). The PDF might be image-based, password-protected, or corrupted. Please provide a text-based PDF."}), 400

            analysis_result = resume_analyzer.analyze_resume_text(extracted_text)
            app.logger.info(f"PYTHON_FLASK_LOG: Analysis successful for {file.filename}")
            return jsonify(analysis_result), 200
            
        except Exception as e:
            app.logger.error(f"PYTHON_FLASK_ERROR: Error processing resume '{file.filename}': {e}", exc_info=True)
            if "PdfReadError" in str(type(e).__name__) or "EOF marker not found" in str(e) :
                 return jsonify({"error": "Failed to read PDF (Flask backend). It might be corrupted, password-protected, or not a valid PDF."}), 400
            return jsonify({"error": f"An unexpected error occurred during analysis in Flask: {str(e)}"}), 500
            
    app.logger.error("PYTHON_FLASK_ERROR: Unknown error occurred with file processing in Flask.")
    return jsonify({"error": "An unknown error occurred while processing the file in Flask."}), 500

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Use environment variable for port if available (for PythonAnywhere)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
