# File: python-resume-analyzer/resume_analyzer.py
# Description: Core logic for PDF parsing and resume analysis. (Enhanced Logging)

import PyPDF2 
import re
# import spacy # Uncomment if you've set up spaCy
# nlp = spacy.load("en_core_web_sm") # Uncomment if you've set up spaCy

def extract_text_from_pdf(pdf_file_stream):
    """
    Extracts text from a PDF file stream.
    Args:
        pdf_file_stream: A file-like object (stream) of the PDF.
    Returns:
        str: The extracted text, or an empty string if extraction fails.
    """
    text = ""
    try:
        print("PYTHON_LOG: Attempting to read PDF with PyPDF2...")
        reader = PyPDF2.PdfReader(pdf_file_stream)
        num_pages = len(reader.pages)
        print(f"PYTHON_LOG: PDF has {num_pages} page(s).")
        
        if num_pages == 0:
            print("PYTHON_LOG: Warning - PDF has no pages or PyPDF2 could not detect them.")
            return "" # Return empty if no pages
            
        for page_num in range(num_pages):
            page = reader.pages[page_num]
            page_text = page.extract_text()
            if page_text:
                text += page_text
                print(f"PYTHON_LOG: Successfully extracted text from page {page_num + 1} (approx {len(page_text)} chars).")
            else:
                print(f"PYTHON_LOG: Warning - No text extracted from page {page_num + 1}. This page might be image-based or empty.")
        
        if not text.strip():
            print("PYTHON_LOG: Warning - Extracted text is empty after processing all pages.")
        else:
            print(f"PYTHON_LOG: Total extracted text length: {len(text)} characters.")
        return text
    except Exception as e:
        print(f"PYTHON_ERROR: ERROR during PDF text extraction with PyPDF2: {e}")
        print("PYTHON_ERROR: This could be due to a corrupted PDF, password protection, or an unsupported PDF format/feature for PyPDF2.")
        return "" # Return empty string on failure

def analyze_resume_text(text: str) -> dict:
    """
    Analyzes the extracted resume text.
    This is where your core NLP logic will go.
    Args:
        text (str): The text content of the resume.
    Returns:
        dict: A dictionary containing the analysis results.
    """
    print(f"PYTHON_LOG: Analyzing resume text. Received text length: {len(text)} characters.")
    if not text.strip(): # Check if text is empty or only whitespace
        print("PYTHON_LOG: Analysis aborted - Received empty or whitespace-only text.")
        return {
            "error": "Could not extract readable text from the resume. The PDF might be image-based, password-protected, or the text content is empty. Please try a different PDF.",
            "score": 0,
            "contentQuality": 0,
            "atsCompatibility": 0,
            "keywordOptimization": 0,
            "suggestions": ["The resume appears to be empty or unreadable. Please upload a text-based PDF."],
            "keywords": {"present": [], "missing": []},
            "sections": {},
            "raw_text_preview": "No text extracted."
        }

    # --- Placeholder for your actual NLP analysis ---
    # This section needs to be implemented with robust NLP techniques.
    print("PYTHON_LOG: Performing placeholder NLP analysis...")
    keywords_present = list(set(re.findall(r'\b(Python|JavaScript|React|Node\.js|SQL|AWS|Communication|Leadership|Project Management)\b', text, re.IGNORECASE)))
    print(f"PYTHON_LOG: Keywords found (placeholder): {keywords_present}")
    
    score = min(len(keywords_present) * 8 + 20, 100) 
    content_quality = max(0, score - 5)
    ats_compatibility = max(0, score - 10)
    keyword_optimization = score
    
    suggestions = []
    if "Python" not in keywords_present and "Java" not in keywords_present:
        suggestions.append("Consider highlighting key programming languages like Python or Java if proficient.")
    if len(text.split()) < 150: # Basic length check
        suggestions.append("The resume seems brief. Ensure all relevant experiences and skills are included. Aim for at least 150-200 words for a basic review.")
    else:
        suggestions.append("Good overall length. Ensure content is concise and impactful.")
    
    suggestions.append("Tailor your resume to each job description for better keyword alignment.")
    print(f"PYTHON_LOG: Generated suggestions (placeholder): {suggestions}")

    analysis = {
        "score": score,
        "contentQuality": content_quality,
        "atsCompatibility": ats_compatibility,
        "keywordOptimization": keyword_optimization,
        "suggestions": suggestions,
        "keywords": {
            "present": keywords_present,
            "missing": ["Cloud Computing", "DevOps", "Data Analysis"] # Example missing keywords
        },
        "sections": { 
            "summary": {
                "clarity": 7, 
                "impact": 6,  
                "feedback": "Review summary for conciseness and impact. Ensure it highlights your key strengths and career goals relevant to the roles you're targeting."
            },
            "experience": {
                "achievementFocus": 8, 
                "quantifiableResults": 5, 
                "feedback": "Focus on quantifying achievements in your experience section (e.g., 'Increased sales by 15%' vs. 'Responsible for sales'). Use action verbs."
            },
            "skills": {
                "relevance": 9, 
                "organization": 7, 
                "feedback": "Ensure your skills section is well-organized and lists skills most relevant to the jobs you are applying for. Consider categorizing them (e.g., Technical Skills, Soft Skills)."
            }
        },
        "raw_text_preview": text[:800] + ("..." if len(text) > 800 else "") # Send a preview
    }
    print("PYTHON_LOG: Placeholder analysis complete.")
    return analysis
