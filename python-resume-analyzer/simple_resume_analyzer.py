import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import PyPDF2
import docx2txt

class SimpleResumeAnalyzer:
    def __init__(self):
        # Download NLTK resources if not already downloaded
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        self.stop_words = set(stopwords.words('english'))
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF file"""
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text()
        return text
    
    def extract_text_from_docx(self, docx_path):
        """Extract text from DOCX file"""
        return docx2txt.process(docx_path)
    
    def extract_text(self, file_path):
        """Extract text from PDF or DOCX file"""
        if file_path.endswith('.pdf'):
            return self.extract_text_from_pdf(file_path)
        elif file_path.endswith('.docx'):
            return self.extract_text_from_docx(file_path)
        else:
            raise ValueError("Unsupported file format. Please provide PDF or DOCX file.")
    
    def preprocess_text(self, text):
        """Preprocess text by removing special characters, numbers, and stopwords"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords
        filtered_tokens = [word for word in tokens if word not in self.stop_words]
        
        return ' '.join(filtered_tokens)
    
    def extract_skills(self, text):
        """Extract skills from text using regex"""
        # Common technical skills
        common_skills = [
            "python", "java", "javascript", "html", "css", "react", "angular", "vue", 
            "node.js", "express", "django", "flask", "sql", "mysql", "postgresql", 
            "mongodb", "aws", "azure", "gcp", "docker", "kubernetes", "git", "github",
            "machine learning", "deep learning", "data analysis", "data science",
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "excel",
            "word", "powerpoint", "photoshop", "illustrator", "figma", "sketch"
        ]
        
        # Find skills in text
        skills = []
        for skill in common_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text.lower()):
                skills.append(skill)
        
        return skills
    
    def analyze_resume(self, file_path):
        """Analyze resume and extract information"""
        # Extract text from file
        text = self.extract_text(file_path)
        
        # Preprocess text
        processed_text = self.preprocess_text(text)
        
        # Extract skills
        skills = self.extract_skills(text)
        
        # Extract education (simple regex-based approach)
        education = []
        education_patterns = [
            r'(?i)\b(?:B\.?Tech|Bachelor\s+of\s+Technology)\b',
            r'(?i)\b(?:M\.?Tech|Master\s+of\s+Technology)\b',
            r'(?i)\b(?:B\.?E|Bachelor\s+of\s+Engineering)\b',
            r'(?i)\b(?:M\.?E|Master\s+of\s+Engineering)\b',
            r'(?i)\b(?:B\.?Sc|Bachelor\s+of\s+Science)\b',
            r'(?i)\b(?:M\.?Sc|Master\s+of\s+Science)\b',
            r'(?i)\b(?:B\.?A|Bachelor\s+of\s+Arts)\b',
            r'(?i)\b(?:M\.?A|Master\s+of\s+Arts)\b',
            r'(?i)\b(?:Ph\.?D|Doctor\s+of\s+Philosophy)\b',
            r'(?i)\b(?:MBA|Master\s+of\s+Business\s+Administration)\b'
        ]
        
        for pattern in education_patterns:
            matches = re.findall(pattern, text)
            education.extend(matches)
        
        return {
            "skills": skills,
            "education": education,
            "raw_text": text
        }
    
    def calculate_keyword_match(self, resume_text, job_description):
        """Calculate keyword match between resume and job description"""
        # Preprocess texts
        processed_resume = self.preprocess_text(resume_text)
        processed_job = self.preprocess_text(job_description)
        
        # Extract skills from job description
        job_skills = self.extract_skills(job_description)
        
        # Extract skills from resume
        resume_skills = self.extract_skills(resume_text)
        
        # Calculate match
        matching_skills = [skill for skill in resume_skills if skill in job_skills]
        
        # Calculate match percentage
        match_percentage = 0
        if job_skills:
            match_percentage = (len(matching_skills) / len(job_skills)) * 100
        
        return {
            "matching_skills": matching_skills,
            "missing_skills": [skill for skill in job_skills if skill not in resume_skills],
            "match_percentage": round(match_percentage, 2),
            "resume_skills": resume_skills,
            "job_skills": job_skills
        }
