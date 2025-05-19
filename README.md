# JobTrackr - AI-Powered Job Application Tracker & Resume Analyzer

JobTrackr is a comprehensive tool designed to streamline your job search process. It helps you track your job applications, get AI-powered analysis of your resume, compare your resume against job descriptions, and receive intelligent career advice.

## Overview

Finding a job can be overwhelming. JobTrackr aims to simplify this by providing a centralized dashboard to manage your applications and leverage AI to enhance your resume and interview preparedness. This project combines a Next.js frontend with a Python (Flask) backend for resume processing and AI integrations (using Google's Gemini).

**Note:** The currently deployed version of the frontend does not have a live public Python backend URL pre-configured for the resume analysis features. To use the full resume analysis capabilities, you will need to set up and run the Python backend service yourself, as described in the "Setting up the Python Resume Analysis Backend" section below.

## Features

* **Job Application Tracking:** Log and manage all your job applications, including status, deadlines, company details, and notes.
* **AI Resume Analysis:** Upload your resume (PDF, DOC, DOCX) to get an AI-generated score, content quality assessment, ATS compatibility insights, keyword optimization tips, and actionable suggestions.
* **AI Keyword Matcher:** Paste a job description to compare it against your analyzed resume and identify matching and missing keywords.
* **AI Career Assistant:** Chat with an AI assistant (powered by Google Gemini) for career advice, resume tips, and interview preparation.
* **User Authentication:** Secure login and registration for users.
* **Admin Dashboard:** (Optional, if implemented) Interface for administrators to manage users and job postings.
* **Responsive Design & Theme Toggle:** User-friendly interface with light/dark mode.

## Tech Stack

**Frontend:**
* Next.js (React Framework)
* TypeScript
* Tailwind CSS
* Shadcn/ui (UI Components)
* Recharts (for analytics)

**Backend (Resume Analysis & AI):**
* Python
* Flask (for the API)
* Google Generative AI SDK (Gemini)
* PyPDF2 (or other PDF parsing libraries like `pdfplumber` for text extraction - *to be implemented by the user for full functionality*)
* NLP Libraries (e.g., spaCy, NLTK - *to be implemented by the user for advanced analysis*)

**Database (Conceptual - for user data, job tracking):**
* (Not explicitly defined in the provided files, but a real-world application would use PostgreSQL, MongoDB, Supabase, Firebase, etc.)

## Screenshots

  <img width="1680" alt="Screenshot 2025-05-19 at 4 37 26 PM" src="https://github.com/user-attachments/assets/8f39a9be-c75a-4641-b018-c4e3e7b9c0d1" />

**1. Dashboard Overview:**
   <img width="1680" alt="Screenshot 2025-05-19 at 4 33 44 PM" src="https://github.com/user-attachments/assets/c6fe7c13-3f7d-46c5-9420-8c724d017e65" />

**2. Resume Upload & Analysis Tab:**
   <img width="1680" alt="Screenshot 2025-05-19 at 4 34 59 PM" src="https://github.com/user-attachments/assets/127c8213-7970-4aac-889b-eeecee86372d" />

**3. Resume Analysis Results:**
   <img width="1680" alt="Screenshot 2025-05-19 at 4 35 29 PM" src="https://github.com/user-attachments/assets/baa7baf0-5e12-4477-9954-527b783232f6" />

**4. Keyword Matcher:**
   <img width="1680" alt="Screenshot 2025-05-19 at 4 36 09 PM" src="https://github.com/user-attachments/assets/3620c81f-230b-496c-8686-f64f9111c91a" />

**5. AI Career Assistant Chat:**
   <img width="1680" alt="Screenshot 2025-05-19 at 4 37 05 PM" src="https://github.com/user-attachments/assets/f58d771c-2acf-4535-afdb-acb67d24ea19" />


## Getting Started (Frontend - Next.js)

To get the frontend running locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/nishantj0803/job-tracker-resume-analyzer.git](https://github.com/nishantj0803/job-tracker-resume-analyzer.git)
    cd job-tracker-resume-analyzer
    ```

2.  **Install dependencies:**
    (This project uses `pnpm`. If you don't have it, install it with `npm install -g pnpm` or use `npm install` / `yarn install` and adjust accordingly.)
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the Next.js project. You'll need to add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    You will also need to set `PYTHON_BACKEND_URL` once you have the Python backend running (see next section):
    ```env
    PYTHON_BACKEND_URL=http://localhost:5001/analyze_resume 
    # (Or the URL where your Python backend is deployed)
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setting up the Python Resume Analysis Backend

The resume analysis and keyword matching features rely on a Python backend. Here's how you can set it up locally:

1.  **Navigate to the Python backend directory:**
    (Assuming your Python code is in a subdirectory named `python-resume-analyzer`)
    ```bash
    cd python-resume-analyzer 
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Python dependencies:**
    Ensure you have a `requirements.txt` file in this directory. If not, you'll need to create one based on the libraries used (`Flask`, `Flask-CORS`, `PyPDF2`, and any NLP libraries like `spacy`).
    Example `requirements.txt`:
    ```txt
    Flask
    Flask-CORS
    PyPDF2
    # Add other dependencies like:
    # spacy
    # pdfplumber 
    ```
    Then install:
    ```bash
    pip install -r requirements.txt
    ```
    If using spaCy, you'll also need to download a language model:
    ```bash
    python -m spacy download en_core_web_sm 
    ```

4.  **Review and Enhance `resume_analyzer.py`:**
    The provided `resume_analyzer.py` contains placeholder logic for PDF text extraction and analysis. For robust functionality, you will need to:
    * Implement more advanced PDF text extraction (e.g., using `pdfplumber` for better layout handling or OCR for image-based PDFs).
    * Integrate NLP libraries (like spaCy or NLTK) for detailed section identification, keyword extraction, and sentiment analysis.
    * Develop your scoring algorithms and suggestion generation logic.

5.  **Run the Flask development server:**
    The `app.py` file starts the Flask server.
    ```bash
    python app.py
    ```
    By default, it should run on `http://localhost:5001`.

6.  **Configure Next.js Frontend:**
    Ensure the `PYTHON_BACKEND_URL` in your Next.js project's `.env.local` file points to your running Python backend (e.g., `PYTHON_BACKEND_URL=http://localhost:5001/analyze_resume`). Restart your Next.js dev server if you update this.

**Deploying the Python Backend (for a live application):**
If you want to deploy this application fully, you'll need to host the Python Flask backend as a separate service. Options include:
* Containerizing with Docker and deploying to services like Google Cloud Run, AWS Fargate, Heroku, Render, or Fly.io.
* Using Platform-as-a-Service (PaaS) like Heroku (with a `Procfile` and Gunicorn) or Google App Engine.
* Serverless functions (AWS Lambda, Google Cloud Functions) if you refactor the Flask app.
Remember to configure CORS appropriately for your deployed frontend domain.

## Future Enhancements

* [ ] More robust PDF parsing to handle complex layouts and scanned documents (OCR).
* [ ] Advanced NLP for deeper resume section analysis and more nuanced suggestions.
* [ ] Database integration to store user data, job applications, and analysis history.
* [ ] Direct integration with job boards to pull job descriptions.
* [ ] Calendar integration for interview scheduling.
* [ ] Enhanced analytics and visualizations.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information (you'll need to add a LICENSE file if you choose one).

---

Contact: Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/nishantj0803/job-tracker-resume-analyzer](https://github.com/nishantj0803/job-tracker-resume-analyzer)
