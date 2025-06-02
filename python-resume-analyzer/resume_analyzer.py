# File: python-resume-analyzer/resume_analyzer.py
# Description: Core logic for PDF parsing and resume analysis with spaCy integration.

import re
import PyPDF2 
import spacy
from collections import Counter

# Load the spaCy English model
try:
    nlp = spacy.load("en_core_web_sm")
    print("PYTHON_LOG: spaCy en_core_web_sm model loaded successfully.")
except OSError:
    print("PYTHON_ERROR: spaCy 'en_core_web_sm' model not found. Please run:")
    print("PYTHON_ERROR: pip install spacy")
    print("PYTHON_ERROR: python -m spacy download en_core_web_sm")
    print("PYTHON_ERROR: spaCy features will be limited.")
    nlp = None 

def extract_text_from_pdf(pdf_file_stream):
    text = ""
    try:
        reader = PyPDF2.PdfReader(pdf_file_stream) 
        num_pages = len(reader.pages)
        if num_pages == 0:
            print("PYTHON_LOG: Warning - PDF has no pages or PyPDF2 could not detect them.")
            return "" 
        for page_num in range(num_pages):
            page = reader.pages[page_num]
            page_text = page.extract_text()
            if page_text:
                text += page_text
            else:
                print(f"PYTHON_LOG: Warning - No text extracted from page {page_num + 1}. This page might be image-based or empty.")
        if not text.strip():
            print("PYTHON_LOG: Warning - Extracted text is empty after processing all pages.")
        return text
    except Exception as e:
        print(f"PYTHON_ERROR: ERROR during PDF text extraction with PyPDF2: {e}")
        return ""

def identify_sections(text: str) -> dict:
    sections = {}
    section_patterns = {
        "summary": r"(?i)^\s*(summary|objective|profile|about\s+me|professional\s+profile)\s*[:\-\s]*$",
        "experience": r"(?i)^\s*(experience|professional\s+experience|work\s+history|employment|career\s+history|relevant\s+experience)\s*[:\-\s]*$",
        "education": r"(?i)^\s*(education|academic\s+background|qualifications|academic\s+profile)\s*[:\-\s]*$",
        "skills": r"(?i)^\s*(skills|technical\s+skills|core\s+competencies|proficiencies|technical\s+expertise|technologies)\s*[:\-\s]*$",
        "projects": r"(?i)^\s*(projects|personal\s+projects|portfolio|key\s+projects|technical\s+projects|selected\s+projects)\s*[:\-\s]*$",
        "awards": r"(?i)^\s*(awards|honors|recognitions|achievements)\s*[:\-\s]*$",
        "publications": r"(?i)^\s*(publications|presentations)\s*[:\-\s]*$",
        "references": r"(?i)^\s*(references)\s*[:\-\s]*$",
        "contact": r"(?i)^\s*(contact|contact\s+information|personal\s+details)\s*[:\-\s]*$"
    }
    lines = text.splitlines()
    current_section_name = None
    current_section_content = []
    header_content = []
    first_section_found = False
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped: 
            if current_section_name: current_section_content.append(line)
            elif not first_section_found: header_content.append(line)
            continue
        matched_section_this_line = False
        for section_name, pattern in section_patterns.items():
            match = re.match(pattern, line_stripped)
            if match and len(line_stripped.split()) < 7 and not any(char.isdigit() for char in line_stripped) : 
                first_section_found = True
                if current_section_name and current_section_content: 
                    sections[current_section_name] = "\n".join(current_section_content).strip()
                current_section_name = section_name
                current_section_content = [] 
                matched_section_this_line = True
                break 
        if not matched_section_this_line:
            if current_section_name: current_section_content.append(line)
            elif not first_section_found: header_content.append(line)
    if current_section_name and current_section_content:
        sections[current_section_name] = "\n".join(current_section_content).strip()
    if header_content and not sections.get("summary") and not sections.get("contact"):
        potential_preamble = "\n".join(header_content).strip()
        if 5 < len(potential_preamble.split()) < 150 : 
            if "summary" not in sections: sections["summary_implicit"] = potential_preamble 
            elif "contact" not in sections: sections["contact_implicit"] = potential_preamble
    if not sections: 
        sections["general_content"] = text.strip()
    # for name, content in sections.items():
        # print(f"PYTHON_LOG: Final identified section: '{name}' (approx {len(content)} chars)")
    return sections

def generate_skill_patterns(skill_list: list):
    patterns = []
    for skill in skill_list:
        skill_lower = skill.lower()
        pattern_tokens = []
        if skill_lower == "c#": pattern_tokens = [{"LOWER": "c"}, {"TEXT": "#"}]
        elif skill_lower == "c++": pattern_tokens = [{"LOWER": "c"}, {"TEXT": {"REGEX": r"(\+\+)"}}]
        elif ".js" in skill_lower and not skill_lower.startswith("."): 
            parts = skill_lower.rsplit('.', 1)
            if len(parts) == 2 and parts[1] == "js": pattern_tokens = [{"LOWER": parts[0].replace(" ", "").replace("-", "")}, {"LOWER": "."}, {"LOWER": "js"}]
            else: pattern_tokens = [{"LOWER": token.strip()} for token in re.split(r'(\s|\.|\#|\+)', skill_lower) if token and token.strip()]
        elif " " in skill_lower: pattern_tokens = [{"LOWER": token} for token in skill_lower.split()]
        else: pattern_tokens = [{"LEMMA": skill_lower}]
        if pattern_tokens: patterns.append({"label": skill.upper(), "pattern": pattern_tokens})
    return patterns

def extract_keywords_from_text_spacy(doc, skill_list: list) -> list:
    if not nlp: return [] 
    found_keywords = set()
    matcher = spacy.matcher.Matcher(nlp.vocab)
    skill_patterns = generate_skill_patterns(skill_list)
    for p in skill_patterns: matcher.add(p["label"], [p["pattern"]])
    matches = matcher(doc)
    for match_id, start, end in matches:
        original_skill_name_from_list = nlp.vocab.strings[match_id] 
        matched_skill = next((s for s in skill_list if s.upper() == original_skill_name_from_list), original_skill_name_from_list)
        found_keywords.add(matched_skill)
    return list(found_keywords)

def analyze_individual_job_entry(job_text: str) -> dict:
    """Analyzes a single job entry text for action verbs and quantifiable results."""
    if not nlp: return {"action_verbs_count": 0, "quantifiable_results_count": 0, "bullet_points_count": 0, "action_verb_lemmas": [], "feedback": "spaCy model not loaded."}
    
    doc_job_entry = nlp(job_text)
    action_verb_lemmas = set()
    bullet_points_count = 0
    quantifiable_results_count = 0
    
    bullet_point_starts = ['-', '*', '•', '➢', '‣', '◦']
    for line in job_text.splitlines():
        stripped_line = line.strip()
        if stripped_line.startswith(tuple(bullet_point_starts)):
            bullet_points_count +=1
            line_doc = nlp(stripped_line[1:].strip()) 
            if len(line_doc) > 0:
                token = line_doc[0]
                if token.pos_ == "VERB" and token.is_alpha and not token.is_stop:
                    action_verb_lemmas.add(token.lemma_.lower())

    job_entry_sents_list = list(doc_job_entry.sents) # Convert generator to list
    if bullet_points_count == 0 and len(job_entry_sents_list) > 0: # CORRECTED LINE
        for sent in job_entry_sents_list: # Iterate over the list
            if len(sent) > 0:
                token = sent[0]
                if token.pos_ == "VERB" and token.is_alpha and not token.is_stop:
                     action_verb_lemmas.add(token.lemma_.lower())
        bullet_points_count = len(job_entry_sents_list) 

    quantifiable_patterns = [
        r"\b\d{1,3}(?:,\d{3})*(?:\.\d+)?%?\b", r"\b\d+(?:\.\d+)?[KMBkm]\b", r"[\$€£]\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?", 
        r"\b(?:increase[sd]?|decrease[sd]?|grew|reduce[sd]?|save[sd]?|improve[sd]?|optimize[sd]?|achieve[sd]?|manage[sd]?|led|generate[sd]?|deliver[sd]?|exceed[ed]*|surpasse[sd]*)\s+(?:by\s+|to\s+|approx\.?\s+)?\d+(?:\.\d+)?%?",
        r"\b(?:over|more\s+than|under|less\s+than|approx(?:imately)?\.?|about|up\s+to|at\s+least)\s+\d+(?:\.\d+)?\b", 
        r"\b\d+(?:\.\d+)?\s+(?:units|users|clients|projects|dollars|hours|transactions|downloads|features|campaigns|items|records|revenue|percent|points|members|customers|leads|bugs|tickets|deployments|releases)\b"
    ]
    for pattern in quantifiable_patterns: quantifiable_results_count += len(re.findall(pattern, job_text, re.IGNORECASE))

    feedback_parts = []
    if bullet_points_count > 0:
        if len(action_verb_lemmas) >= bullet_points_count * 0.6: feedback_parts.append(f"Good use of action verbs ({len(action_verb_lemmas)} found).")
        else: feedback_parts.append("Strengthen bullet points by starting them with varied, strong action verbs.")
        if quantifiable_results_count >= bullet_points_count * 0.3: feedback_parts.append(f"Good inclusion of quantifiable results ({quantifiable_results_count} metrics).")
        else: feedback_parts.append("Quantify more achievements within bullet points to show impact.")
    else:
        feedback_parts.append("Consider using bullet points for clarity and impact.")

    return {
        "action_verbs_count": len(action_verb_lemmas), 
        "quantifiable_results_count": quantifiable_results_count,
        "bullet_points_count": bullet_points_count,
        "action_verb_lemmas": list(action_verb_lemmas),
        "feedback": " ".join(feedback_parts) if feedback_parts else "Describe your responsibilities and achievements clearly."
    }

def segment_experience(experience_text: str) -> list:
    if not nlp: return [{"role_text": experience_text, "title_guess": "Experience Details", "company_guess": "N/A", "dates_guess": "N/A", **analyze_individual_job_entry(experience_text)}]
    
    doc = nlp(experience_text)
    job_entries_data = []
    current_entry_lines = []
    current_title, current_company, current_dates = "N/A", "N/A", "N/A"
    
    date_pattern = r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current|To\sDate)[\w\s\.,\-–'’]*\d{4}\b|\b\d{4}\s*-\s*\d{4}\b|\b\d{4}\s*-\s*Present\b"
    job_title_keywords = ["engineer", "developer", "manager", "analyst", "specialist", "lead", "architect", "consultant", "director", "president", "officer", "intern", "associate", "coordinator", "designer", "scientist", "administrator", "executive", "head of"]

    def save_current_entry():
        if current_entry_lines:
            role_text = "\n".join(current_entry_lines).strip()
            analysis = analyze_individual_job_entry(role_text)
            job_entries_data.append({
                "role_text": role_text,
                "title_guess": current_title if current_title != "N/A" else (analysis.get("job_titles_in_text", ["N/A"])[0] if analysis.get("job_titles_in_text") else "N/A"),
                "company_guess": current_company,
                "dates_guess": current_dates,
                **analysis 
            })
            return True
        return False

    lines = experience_text.splitlines()
    for i, line in enumerate(lines):
        stripped_line = line.strip()
        if not stripped_line:
            current_entry_lines.append(line) 
            continue

        date_match = re.search(date_pattern, stripped_line, re.IGNORECASE)
        line_doc = nlp(stripped_line)
        org_entities = [ent.text for ent in line_doc.ents if ent.label_ == "ORG"]
        
        is_new_header = False
        line_is_potential_title = False
        if len(stripped_line.split()) < 7 and sum(1 for w in stripped_line.split() if w.istitle() or w.isupper()) > len(stripped_line.split())/2 :
            if any(tk.lower() in stripped_line.lower() for tk in job_title_keywords):
                line_is_potential_title = True

        if date_match:
            is_new_header = True
        elif org_entities and (not current_company or current_company not in org_entities[0] or (current_company == org_entities[0] and line_is_potential_title)): # New company or same company but new title
            is_new_header = True
        elif line_is_potential_title and (not current_title or current_title.lower() not in stripped_line.lower()): # New title
             is_new_header = True


        if is_new_header and i > 0 and current_entry_lines : 
            if save_current_entry(): 
                current_title, current_company, current_dates = "N/A", "N/A", "N/A"
                if date_match: current_dates = date_match.group(0).strip()
                if org_entities: current_company = org_entities[0]
                if line_is_potential_title: current_title = stripped_line
                current_entry_lines = [line] 
                continue 

        current_entry_lines.append(line)
        if current_title == "N/A" and line_is_potential_title: current_title = stripped_line
        if current_company == "N/A" and org_entities: current_company = org_entities[0]
        if current_dates == "N/A" and date_match: current_dates = date_match.group(0).strip()

    save_current_entry() 

    if not job_entries_data: 
        analysis = analyze_individual_job_entry(experience_text)
        job_entries_data.append({"role_text": experience_text, "title_guess": "Experience Details", "company_guess": "N/A", "dates_guess": "N/A", **analysis})

    print(f"PYTHON_LOG: Segmented experience into {len(job_entries_data)} roles.")
    # for i, entry in enumerate(job_entries_data):
        # print(f"  Role {i+1}: Title='{entry.get('title_guess')}', AV={entry.get('action_verbs_count')}, QR={entry.get('quantifiable_results_count')}")
    return job_entries_data


def analyze_experience_section_spacy(doc_experience) -> dict:
    if not nlp: return {"action_verbs_count": 0, "quantifiable_results_count": 0, "feedback": "spaCy model not loaded.", "job_titles": [], "bullet_points_count": 0, "unique_action_verbs": 0, "parsed_roles": []}
    
    experience_text = doc_experience.text
    parsed_roles = segment_experience(experience_text) 
    
    total_action_verbs = sum(role.get("action_verbs_count", 0) for role in parsed_roles)
    total_quantifiables = sum(role.get("quantifiable_results_count", 0) for role in parsed_roles)
    total_bullets = sum(role.get("bullet_points_count", 0) for role in parsed_roles)
    
    all_job_titles = sorted(list(set(role.get("title_guess", "N/A") for role in parsed_roles if role.get("title_guess") not in ["N/A", "Experience Details"])))
    all_companies = sorted(list(set(role.get("company_guess", "N/A") for role in parsed_roles if role.get("company_guess") != "N/A")))
    all_dates = sorted(list(set(role.get("dates_guess", "N/A") for role in parsed_roles if role.get("dates_guess") != "N/A")))
    
    # Collect all unique action verb lemmas from all roles
    all_action_verb_lemmas = set()
    for role in parsed_roles:
        all_action_verb_lemmas.update(role.get("action_verb_lemmas", []))
    unique_action_verbs_overall = len(all_action_verb_lemmas)


    feedback_parts = []
    if not parsed_roles or (len(parsed_roles) == 1 and parsed_roles[0]["title_guess"] == "Experience Details"):
        feedback_parts.append("Could not clearly segment individual job roles. Ensure each role has a clear title, company, and dates, possibly on separate lines or distinctly formatted.")
        # Analyze the whole block if segmentation failed
        overall_analysis_fallback = analyze_individual_job_entry(experience_text)
        total_action_verbs = overall_analysis_fallback["action_verbs_count"]
        total_quantifiables = overall_analysis_fallback["quantifiable_results_count"]
        total_bullets = overall_analysis_fallback["bullet_points_count"]
        unique_action_verbs_overall = total_action_verbs


    if total_bullets == 0 and len(experience_text) > 100:
        feedback_parts.append("Consider using bullet points to list accomplishments for each role for readability.")
    elif total_bullets > 0:
        feedback_parts.append(f"Across {len(parsed_roles)} identified role(s), detected approximately {total_bullets} descriptive points/bullets.")
        if unique_action_verbs_overall >= total_bullets * 0.5 : 
            feedback_parts.append(f"Good overall use of action verbs ({unique_action_verbs_overall} unique verbs found).")
            if unique_action_verbs_overall < total_bullets * 0.8 and unique_action_verbs_overall > len(parsed_roles) * 1.5 : # Check if variety is good
                 feedback_parts.append("Consider using an even wider variety of action verbs if appropriate.")
        elif unique_action_verbs_overall > 0:
            feedback_parts.append(f"Some points start with action verbs ({unique_action_verbs_overall} unique verbs). Aim to start most bullet points with varied, strong action verbs.")
        else:
            feedback_parts.append("Start each bullet point with a strong action verb to clearly state your actions and accomplishments.")
        
        if total_quantifiables >= total_bullets * 0.3 and total_bullets > 1: 
            feedback_parts.append(f"Good inclusion of quantifiable results ({total_quantifiables} metrics found across roles).")
        elif total_quantifiables > 0:
            feedback_parts.append(f"Some quantifiable results noted ({total_quantifiables} metrics). Try to quantify more achievements.")
        else:
            feedback_parts.append("Increase quantification of achievements in your bullet points to demonstrate impact.")

    if not all_job_titles and total_bullets > 0: feedback_parts.append("Job titles are not clearly identifiable for all roles.")
    elif all_job_titles: feedback_parts.append(f"Identified job titles like: {', '.join(all_job_titles[:3])}{'...' if len(all_job_titles) > 3 else ''}.")
    
    if not all_dates and total_bullets > 1 : feedback_parts.append("Add employment dates for each role for clarity.")
    
    if len(parsed_roles) > 1 or (parsed_roles and parsed_roles[0]["title_guess"] != "Experience Details"):
        for i, role in enumerate(parsed_roles):
            role_feedback = f"For your role as '{role.get('title_guess','Unknown Title')}' at '{role.get('company_guess','Unknown Company')}': "
            role_points = []
            if role.get("action_verbs_count",0) < max(1, role.get("bullet_points_count",0) * 0.5):
                role_points.append("enhance use of action verbs for its bullet points.")
            if role.get("quantifiable_results_count",0) < max(1, role.get("bullet_points_count",0) * 0.25):
                role_points.append("add more quantifiable achievements to its description.")
            if role_points:
                feedback_parts.append(role_feedback + " ".join(role_points))

    return {
        "action_verbs_count": total_action_verbs, # Total across all roles
        "unique_action_verbs": unique_action_verbs_overall, 
        "quantifiable_results_count": total_quantifiables, # Total across all roles
        "feedback": " ".join(feedback_parts) if feedback_parts else "Experience section noted. Ensure clear job titles, dates, and use action-oriented, quantified bullet points for each role.", 
        "companies": all_companies, 
        "job_titles": all_job_titles, 
        "dates": all_dates,
        "bullet_points_count": total_bullets, # Total across all roles
        "parsed_roles": parsed_roles 
    }


def analyze_education_section_spacy(doc_education) -> dict:
    # ... (Keep the enhanced version from the previous update)
    if not nlp: return {"clarity": 0, "feedback": "spaCy model not loaded.", "degrees": [], "institutions": [], "grad_dates": []}
    analysis = {"clarity": 5, "feedback": "", "degrees": [], "institutions": [], "grad_dates": [], "gpa_found": False, "relevant_coursework_honors_found": False}
    for ent in doc_education.ents:
        if ent.label_ == "ORG": analysis["institutions"].append(ent.text.strip())
        elif ent.label_ == "DATE": 
            if re.search(r"\b(?:19|20)\d{2}\b", ent.text): analysis["grad_dates"].append(ent.text.strip())
    degree_keywords = [r"B\.S\.?", r"M\.S\.?", r"Ph\.D\.?", r"Bachelor(?:'s)?\s*(?:of\s*(?:Science|Arts|Engineering|Technology|Business|Commerce|Applied\sScience))?", r"Master(?:'s)?\s*(?:of\s*(?:Science|Arts|Engineering|Technology|Business|Administration|Applied\sScience))?", r"Associate(?:'s)?", r"Diploma", r"Certificate", r"B\.Tech", r"M\.Tech", r"MBA", r"Doctorate", r"B\.A\.", r"M\.A\."]
    for keyword_pattern in degree_keywords:
        matches = re.finditer(keyword_pattern + r"(?:\s+(?:in|of)\s+[\w\s\(\)&/-]+)?", doc_education.text, re.IGNORECASE)
        for match in matches: 
            degree_text = match.group(0).strip()
            if len(degree_text.split()) < 12: analysis["degrees"].append(degree_text)
    analysis["institutions"] = sorted(list(set(analysis["institutions"])))
    analysis["grad_dates"] = sorted(list(set(analysis["grad_dates"])))
    analysis["degrees"] = sorted(list(set(d for d in analysis["degrees"] if len(d.split()) > 1 or any(kw.replace(r"(?:'s)?","").replace(r"\s*(?:of\s*(?:Science|Arts|Engineering|Technology|Business|Commerce|Applied\sScience))?","").lower() in d.lower() for kw in ["Bachelor", "Master", "Associate", "Doctorate", "Diploma", "Certificate", "B.S", "M.S", "Ph.D", "MBA", "B.Tech", "M.Tech"] ))))
    if re.search(r"(?i)(?:GPA|Grade\s*Point\s*Average|CGPA)\s*[:\s]*\d\.\d+", doc_education.text): analysis["gpa_found"] = True
    if re.search(r"(?i)(?:Relevant\s*Coursework|Honors|Dean's\s*List|Cum\s*Laude|Scholarship|Awarded)", doc_education.text): analysis["relevant_coursework_honors_found"] = True
    clarity_score = 2
    if analysis["institutions"]: clarity_score += 2
    if analysis["degrees"]: clarity_score += 3
    if analysis["grad_dates"]: clarity_score += 2
    if analysis["gpa_found"] or analysis["relevant_coursework_honors_found"]: clarity_score +=1
    analysis["clarity"] = min(clarity_score, 10)
    feedback_parts = []
    if not analysis["institutions"]: feedback_parts.append("Institution names not clearly identified.")
    else: feedback_parts.append(f"Identified {len(analysis['institutions'])} institution(s) (e.g., {', '.join(analysis['institutions'][:2])}).")
    if not analysis["degrees"]: feedback_parts.append("Degree names not clearly identified.")
    else: feedback_parts.append(f"Identified {len(analysis['degrees'])} degree(s) (e.g., {', '.join(analysis['degrees'][:1])}).")
    if not analysis["grad_dates"]: feedback_parts.append("Graduation dates (or expected) not clearly identified.")
    if not analysis["gpa_found"]: feedback_parts.append("If GPA is strong (e.g., 3.5+), consider adding it, especially if a recent graduate.")
    if not analysis["relevant_coursework_honors_found"]: feedback_parts.append("Consider adding relevant coursework or academic honors if applicable.")
    if clarity_score < 7: feedback_parts.insert(0, "Ensure education details (institution, degree, graduation date) are clear.")
    else: feedback_parts.append("Education details seem relatively clear.")
    analysis["feedback"] = " ".join(feedback_parts)
    return analysis

def analyze_projects_section_spacy(doc_projects, skill_list) -> dict:
    # ... (Keep the enhanced version from the previous update)
    if not nlp: return {"clarity": 0, "feedback": "spaCy model not loaded.", "project_count": 0, "tech_keywords_count": 0}
    analysis = {"clarity": 5, "feedback": "", "project_count": 0, "tech_keywords_count": 0, "project_titles": []}
    project_titles_set = set()
    project_lines = doc_projects.text.splitlines()
    for i, line in enumerate(project_lines):
        stripped_line = line.strip()
        if stripped_line:
            is_likely_title = (stripped_line[0].isupper() and len(stripped_line.split()) < 8 and not stripped_line.startswith(('-', '*', '•')) and (i == 0 or not project_lines[i-1].strip().endswith((',', ';', 'and', 'or', 'for', 'with', 'to', 'in', 'on', 'at', 'of'))))
            if is_likely_title:
                analysis["project_count"] += 1
                title_candidate = re.sub(r"\s*\|.*$", "", stripped_line).strip()
                title_candidate = re.sub(r"\s*\(.*$", "", title_candidate).strip()
                if len(title_candidate) > 2: project_titles_set.add(title_candidate)
    project_keywords = extract_keywords_from_text_spacy(doc_projects, skill_list)
    analysis["tech_keywords_count"] = len(project_keywords)
    clarity_score = 3
    if analysis["project_count"] > 0: clarity_score +=3
    if analysis["tech_keywords_count"] > 0 and analysis["project_count"] > 0: clarity_score +=2 
    if len(project_titles_set) > 0 : clarity_score +=1 
    analysis["clarity"] = min(clarity_score, 10)
    feedback_parts = []
    if analysis["project_count"] == 0 and len(doc_projects.text) > 50: feedback_parts.append("No distinct projects clearly identified. If you have projects, ensure each has a clear title and is well-separated.")
    elif analysis["project_count"] > 0:
        feedback_parts.append(f"Identified approximately {analysis['project_count']} project(s).")
        if project_titles_set: feedback_parts.append(f"Potential project titles include: {', '.join(list(project_titles_set)[:2])}{'...' if len(project_titles_set) > 2 else ''}.")
        else: feedback_parts.append("Try to make project titles more prominent.")
    if analysis["tech_keywords_count"] > 0: feedback_parts.append(f"Good job mentioning {analysis['tech_keywords_count']} technologies/skills within project descriptions (e.g., {', '.join(project_keywords[:3])}... ).")
    elif analysis["project_count"] > 0: feedback_parts.append("For each project, clearly list the key technologies, tools, or programming languages used to showcase your technical abilities.")
    if analysis["project_count"] > 0: feedback_parts.append("For each project, briefly describe its purpose, your specific role or contributions, and the outcome or impact if possible. Use bullet points for achievements.")
    analysis["feedback"] = " ".join(feedback_parts) if feedback_parts else "Project section noted. Ensure each project details your role, technologies, and impact."
    analysis["project_titles"] = list(project_titles_set)[:3] 
    return analysis


def analyze_resume_text(text: str) -> dict:
    if not nlp: 
        return { "error": "NLP model (spaCy) could not be loaded. Analysis features are limited.", 
            "score": 0, "contentQuality": 0, "atsCompatibility": 0, "keywordOptimization": 0,
            "suggestions": ["Critical NLP component failed to load. Please contact support."],
            "keywords": {"present": [], "missing": []}, "sections": {}, "raw_text_preview": text[:1000] }

    if not text.strip(): 
        return { "error": "Could not extract readable text from the resume.",
            "score": 0, "contentQuality": 0, "atsCompatibility": 0, "keywordOptimization": 0,
            "suggestions": ["The resume appears to be empty or unreadable. Please upload a text-based PDF."],
            "keywords": {"present": [], "missing": []}, "sections": {}, "raw_text_preview": "No text extracted." }

    doc = nlp(text) 
    extracted_sections_content = identify_sections(text) 

    common_skills_list = [ 
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Ruby", "Swift", "Kotlin", "PHP", "Scala", "Rust", "Perl", "Objective-C",
        "React", "React.js", "Angular", "AngularJS", "Vue.js", "Svelte", "HTML", "HTML5", "CSS", "CSS3", "SASS", "SCSS", "LESS", "jQuery", "Bootstrap", "Tailwind CSS", "Next.js", "Nuxt.js", "Gatsby", "Ember.js", "Redux", "Vuex", "MobX",
        "Node.js", "Express.js", "Django", "Flask", "Spring", "Spring Boot", "Ruby on Rails", ".NET", ".NET Core", "ASP.NET", "FastAPI", "Laravel", "Symfony",
        "SQL", "MySQL", "PostgreSQL", "Microsoft SQL Server", "MongoDB", "NoSQL", "Oracle", "SQLite", "Firebase", "Firestore", "DynamoDB", "Redis", "Cassandra", "Elasticsearch",
        "Amazon Web Services", "AWS", "Microsoft Azure", "Azure", "Google Cloud Platform", "GCP", "Heroku", "DigitalOcean", "Linode", "Vercel", "Netlify", "CloudFormation", "ARM Templates",
        "Docker", "Kubernetes", "K8s", "CI/CD", "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Travis CI", "ArgoCD", "Spinnaker",
        "Terraform", "Ansible", "Chef", "Puppet", "Linux", "Unix", "Shell Scripting", "Bash", "PowerShell", "Windows Server",
        "Machine Learning", "ML", "Deep Learning", "DL", "Artificial Intelligence", "AI", "Natural Language Processing", "NLP", "Computer Vision", "CV",
        "Data Analysis", "Data Science", "Data Engineering", "Data Visualization", "Statistics", "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "Apache Spark", "Tableau", "Power BI",
        "Big Data", "Hadoop", "Spark", "Kafka", "Data Warehousing", "ETL", "Airflow", "Snowflake", "Redshift",
        "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Lean", "Six Sigma", "DevOps", "Site Reliability Engineering", "SRE",
        "RESTful APIs", "REST APIs", "GraphQL", "Microservices", "API Design", "SOAP", "gRPC", "WebSockets", "OAuth", "JWT",
        "Cybersecurity", "Information Security", "Network Security", "Penetration Testing", "Cryptography", "SIEM", "Firewalls", "Ethical Hacking",
        "Problem Solving", "Communication Skills", "Teamwork", "Collaboration", "Leadership", "Project Management", "Product Management", 
        "Analytical Skills", "Critical Thinking", "Creativity", "Adaptability", "Time Management", "Customer Service", "Sales", "Marketing", "UI/UX Design", "User Experience", "User Interface", "Figma", "Adobe XD", "Sketch"
    ]
    
    all_keywords_present = extract_keywords_from_text_spacy(doc, common_skills_list) 
    
    final_sections_analysis = {}
    summary_analysis_data = {}
    experience_analysis_data = {}
    skills_analysis_data = {}
    education_analysis_data = {}
    projects_analysis_data = {} 

    summary_text_content = extracted_sections_content.get("summary") or extracted_sections_content.get("summary_implicit", "")
    if summary_text_content:
        doc_summary = nlp(summary_text_content) 
        summary_sents_list = list(doc_summary.sents) 
        num_sents = len(summary_sents_list)
        clarity_score = 8 if num_sents >= 2 and num_sents <= 4 else (5 if num_sents == 1 or num_sents == 5 else 3) 
        impact_words = ["achieved", "led", "drove", "spearheaded", "transformed", "innovated", "launched", "managed", "developed", "created", "pioneered", "orchestrated", "delivered", "generated", "secured", "grew", "reduced", "improved", "optimized", "streamlined", "established"]
        impact_verb_count = sum(1 for token in doc_summary if token.pos_ == "VERB" and token.lemma_.lower() in impact_words)
        impact_score = min(6 + impact_verb_count * 2.5, 10) if impact_verb_count > 0 else 4 
        summary_analysis_data = {
            "clarity": int(clarity_score), "impact": int(impact_score),  
            "feedback": f"Summary ({len(summary_text_content)} chars, {num_sents} sentences): " + 
                        ("Appears well-structured with an appropriate number of sentences. " if clarity_score >= 7 else "Aim for 2-4 concise, impactful sentences for your summary. ") +
                        (f"Effectively uses {impact_verb_count} strong impact verb(s). " if impact_verb_count > 1 else (f"Includes {impact_verb_count} impact verb. " if impact_verb_count ==1 else "" )) +
                        ("Consider incorporating more strong action verbs or highlighting key quantifiable achievements. " if impact_score < 7 else "Strong impact demonstrated.")
        }
        final_sections_analysis["summary"] = summary_analysis_data

    if "experience" in extracted_sections_content:
        experience_text_content = extracted_sections_content["experience"]
        if experience_text_content:
            doc_experience_spacy = nlp(experience_text_content)
            experience_analysis_data = analyze_experience_section_spacy(doc_experience_spacy)
            final_sections_analysis["experience"] = experience_analysis_data
            
    if "skills" in extracted_sections_content:
        skills_text_content = extracted_sections_content["skills"]
        if skills_text_content:
            doc_skills = nlp(skills_text_content) 
            identified_skills_in_section = extract_keywords_from_text_spacy(doc_skills, common_skills_list)
            num_skill_lines = skills_text_content.count('\n') + 1
            organization_score = 8 if num_skill_lines > max(4, len(identified_skills_in_section) / 2.0) else (6 if num_skill_lines > 2 else 4) 
            skills_analysis_data = {
                "relevance": int(min(len(identified_skills_in_section) * 1.5, 10)), 
                "organization": int(organization_score), 
                "feedback": f"Skills section ({len(skills_text_content)} chars): Found {len(identified_skills_in_section)} relevant skills (e.g., {', '.join(identified_skills_in_section[:6])}{'...' if len(identified_skills_in_section) > 6 else ''}). " +
                            ("Appears well-organized. " if organization_score > 6 else "Consider categorizing skills (e.g., 'Programming Languages', 'Cloud Technologies', 'Tools') for enhanced readability and ATS parsing. ") +
                            "Ensure skills listed are tailored to the requirements of target roles."
            }
            final_sections_analysis["skills"] = skills_analysis_data

    if "education" in extracted_sections_content:
        education_text_content = extracted_sections_content["education"]
        if education_text_content:
            doc_education_spacy = nlp(education_text_content)
            education_analysis_data = analyze_education_section_spacy(doc_education_spacy)
            education_analysis_data.setdefault("impact", 0)
            final_sections_analysis["education"] = education_analysis_data
    
    if "projects" in extracted_sections_content:
        projects_text_content = extracted_sections_content["projects"]
        if projects_text_content:
            doc_projects_spacy = nlp(projects_text_content)
            projects_analysis_data = analyze_projects_section_spacy(doc_projects_spacy, common_skills_list)
            projects_analysis_data.setdefault("impact", min(projects_analysis_data.get("tech_keywords_count",0) * 1.5 + projects_analysis_data.get("project_count",0), 9)) 
            final_sections_analysis["projects"] = projects_analysis_data

    score_total = 0
    weights_sum = 0
    num_key_sections_found = 0 
    
    if summary_analysis_data: score_total += (summary_analysis_data.get("clarity",0) + summary_analysis_data.get("impact",0)) * 0.15; weights_sum += 0.15 * 20; num_key_sections_found+=1
    if experience_analysis_data: score_total += (experience_analysis_data.get("unique_action_verbs",0) * 1.0 + experience_analysis_data.get("quantifiable_results_count",0)*2.0) * 0.30 ; weights_sum += 0.30 * 30; num_key_sections_found+=1
    if skills_analysis_data: score_total += (skills_analysis_data.get("relevance",0) + skills_analysis_data.get("organization",0)) * 0.15; weights_sum += 0.15 * 20; num_key_sections_found+=1
    if education_analysis_data: score_total += education_analysis_data.get("clarity",0) * 0.10; weights_sum += 0.10 * 10; num_key_sections_found+=1
    if projects_analysis_data: score_total += (projects_analysis_data.get("clarity",0) + projects_analysis_data.get("impact",0)) * 0.10; weights_sum += 0.10 * 20; num_key_sections_found+=1
    
    base_structural_score = (score_total / weights_sum) * 80 if weights_sum > 0 else 40 
    keyword_bonus = min(len(all_keywords_present) * 0.75, 20) 
    score = min(max(50, int(base_structural_score + keyword_bonus)), 100) 
    content_quality = min(max(55, int(score * 0.85 + keyword_bonus * 0.4 + num_key_sections_found * 2.5)), 100) 
    ats_compatibility = min(max(60, score - 15 + (5 if len(all_keywords_present) > 8 else 0) + (5 if num_key_sections_found >=3 else 0) ), 98) 
    keyword_optimization = min(len(all_keywords_present) * 3, 100) 
    
    suggestions = [] 
    if not summary_analysis_data: suggestions.append("Add a 'Summary' or 'Objective' section to highlight your value proposition.")
    elif summary_analysis_data.get("clarity",0) < 7 : suggestions.append("Refine your Summary for clarity and conciseness (aim for 2-4 impactful sentences).")
    elif summary_analysis_data.get("impact",0) < 7 : suggestions.append("Boost Summary impact with stronger action verbs and highlight key quantifiable achievements.")

    if not experience_analysis_data: suggestions.append("The 'Experience' section is vital; detail roles with strong action verbs and quantifiable results.")
    else:
        if experience_analysis_data.get("quantifiable_results_count", 0) < max(1, experience_analysis_data.get("bullet_points_count",0) * 0.25) : suggestions.append("Increase quantifiable results in your Experience section (e.g., 'Increased X by Y%'). Aim for at least 25% of points to be quantified.")
        if experience_analysis_data.get("unique_action_verbs", 0) < max(2, experience_analysis_data.get("bullet_points_count",0) * 0.5) : suggestions.append("Use more varied and strong action verbs at the start of Experience bullet points.")
        if not experience_analysis_data.get("job_titles") and experience_analysis_data.get("bullet_points_count",0) > 0 : suggestions.append("Ensure job titles in Experience are clear and prominent for each role.")
        if not experience_analysis_data.get("dates") and experience_analysis_data.get("bullet_points_count",0) > 1 : suggestions.append("Add employment dates for each role in Experience for better context.")

    if not skills_analysis_data or skills_analysis_data.get("relevance",0) < 7 : suggestions.append("Enhance your 'Skills' section: ensure it's comprehensive, well-organized (e.g., by category like 'Languages', 'Frameworks', 'Tools'), and lists skills relevant to your target roles.")
    elif skills_analysis_data and skills_analysis_data.get("organization",0) < 7 : suggestions.append("Improve the organization of your Skills section by grouping related skills or using clear formatting.")
    
    if not education_analysis_data or education_analysis_data.get("clarity",0) < 7: suggestions.append("Ensure your 'Education' section clearly states degrees, institutions, and graduation dates (or expected). Consider adding GPA if strong, or relevant coursework/honors for recent graduates.")

    if not projects_analysis_data and ("projects" in extracted_sections_content or len(text.split()) > 450) : 
        suggestions.append("Consider adding or expanding a 'Projects' section to showcase practical application of your skills, especially personal or academic projects relevant to your field.")
    elif projects_analysis_data:
        if projects_analysis_data.get("tech_keywords_count",0) < projects_analysis_data.get("project_count",1) * 0.5 and projects_analysis_data.get("project_count",0) > 0:
            suggestions.append("In your 'Projects' section, clearly mention specific technologies or skills used for each project.")
        if projects_analysis_data.get("project_count",0) > 0 and projects_analysis_data.get("clarity",0) < 7 : 
             suggestions.append("For each project, briefly describe its purpose, your role, and the outcome or impact if possible. Use bullet points for achievements.")

    if len(all_keywords_present) < 15: suggestions.append(f"Your resume includes {len(all_keywords_present)} common skills. Broaden this by adding more relevant technical and soft skills tailored to job descriptions.")
    
    word_count = len(text.split())
    if word_count < 350 and num_key_sections_found > 1: suggestions.append(f"Your resume is concise ({word_count} words). Ensure it captures all key experiences and skills. Aim for 1-2 pages (approx. 450-800 words for most roles).")
    elif word_count > 1000 : suggestions.append(f"Your resume is quite long ({word_count} words). Condense information for readability, ideally within 1-2 pages, focusing on the most relevant details for your target roles.")
    suggestions.append("Tailor your resume for each job application by highlighting the most relevant skills and experiences from the job description.")
    if not any (s_header in extracted_sections_content for s_header in ["experience", "skills", "education"]):
        suggestions.append("Ensure your resume includes standard sections like Experience, Education, and Skills with clear headers for better ATS parsing and readability.")


    missing_keywords = [skill for skill in common_skills_list[:50] if skill.lower() not in (k.lower() for k in all_keywords_present)]

    analysis = {
        "score": int(score), "contentQuality": int(content_quality), "atsCompatibility": int(ats_compatibility), "keywordOptimization": int(keyword_optimization),
        "suggestions": list(set(suggestions)), 
        "keywords": { "present": all_keywords_present, "missing": missing_keywords[:15]}, 
        "sections": final_sections_analysis,
        "raw_text_preview": text[:1000] + ("..." if len(text) > 1000 else "")
    }
    print(f"PYTHON_LOG: spaCy-enhanced analysis complete. Final Score: {score}, Content Quality: {content_quality}")
    return analysis
