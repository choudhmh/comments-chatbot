import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Load structure reference from docx
def load_txt_structure(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Warning: Could not read .txt structure: {e}")
        return ""

# User inputs
user_inputs = {
    "industry_type": "Cosmetic Manufacturing",
    "machine_ids": None,
    "event_types": ["Shift", "Downtime"],
    "roles": ["Operator", "Maintenance", "Supervisor", "Quality Control"],
    "common_issues": None,
    "n_events": 5,
}

# Build the prompt with fallbacks
def build_prompt(inputs, structure_reference=""):
    prompt = f"""
I have attached a document describing the JSON structure for manufacturing event commentary data. Please generate a realistic mock JSON dataset that adheres to this structure.

Use the following user inputs if provided. If a specific input is missing, use your own realistic assumptions to fill in values appropriate to a manufacturing setting.

Industry: {inputs.get("industry_type", "General Manufacturing")}  
Machine Types: {inputs.get("machine_ids", [])}  
Event Types: {inputs.get("event_types", ["Shift", "Downtime"])}  
Factory Roles: {inputs.get("roles", ["Operator", "Maintenance", "Supervisor"])}  
Operational Scenarios: {inputs.get("common_issues", ["unspecified issues"])}  
Number of Events: {inputs.get("n_events", 3)}

Each event should follow this structure:
- The `eventType` must be one of the given event types, and it should include an `eventContext` with realistic metadata (e.g., machineId, shiftId, downtimeId, startTime, endTime, reasonCode where applicable).
- Each event must contain 1 or more `parentComments`, each with metadata like `commentId`, `author` (userId, name, and role), `timestamp`, and `text`.
- Each parent comment can include 0 or more nested `replies`, which reflect realistic follow-up conversation or clarifications.
- Authors should span across the given factory roles or other plausible roles relevant to the industry.

Make the comment content diverse and realistic, incorporating operational details, troubleshooting, quality issues, observations, or shift feedback. Include a variety of tones such as alerts, feedback, suggestions, and factual reporting.

Return a well-formatted JSON array of {inputs.get("n_events", 3)} events with at least a few threads containing nested replies.

Structure Reference:
{structure_reference}
"""
    return prompt

# Load structure txt file
structure_text = load_txt_structure("docs/comment_data_structure.txt")

# Build and send prompt to Gemini
prompt = build_prompt(user_inputs, structure_reference=structure_text)
response = model.generate_content(prompt)

# Try to parse and save response to comment.json
try:    
    json_start = response.text.find("[")
    json_end = response.text.rfind("]") + 1
    json_text = response.text[json_start:json_end]
    comment_data = json.loads(json_text)

    with open("comment.json", "w", encoding="utf-8") as f:
        json.dump(comment_data, f, indent=2)

    print("Mock comment data saved to comment.json")

except Exception as e:
    print("Could not parse or save JSON:", e)
    print("Raw response:")
    print(response.text)

# Input from user
# Industry Type / Company Domain [“label printing”, “pharmaceutical manufacturing”, “automotive assembly”, “cosmetic manufacturing”]
# Common Machine Types or System Components
# Relevant Event Types ["Shift", "Downtime", "JobSetup", "Inspection", "Changeover"]


#notes table -> vorne_devices 
#SBJobs -> SBParts