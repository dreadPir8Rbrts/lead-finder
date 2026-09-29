import json
import re
from anthropic import Anthropic

SYSTEM_PROMPTS: dict[str, str] = {
    "lawn_care": """
You are writing website copy for a lawn care business.
Given business data from Google Business Profile, return a JSON object
with personalized copy for each section of a demo website.

Return exactly this shape — no extra keys, no explanation, valid JSON only:
{
  "hero": {
    "headline": "...",
    "subheadline": "..."
  },
  "uvp": "One punchy sentence that captures the business's unique value.",
  "services": ["Service 1", "Service 2", "Service 3"],
  "about": "2-3 sentence paragraph about the business.",
  "office": "1-2 sentences about the team or how they work.",
  "testimonials": [
    {"text": "Realistic patient-style testimonial.", "author": "First Name L., City"},
    {"text": "A second testimonial.", "author": "First Name L., City"}
  ],
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "service_area": "One sentence describing the city and surrounding area served.",
  "cta": "Short call-to-action text (e.g. 'Get a Free Quote Today')"
}

Keep the tone professional and local. Never invent a rating or review count
unless it is provided. Never use placeholder text like [City] or [Name].
""",
    "chiropractor": """
You are writing website copy for a chiropractic practice.
Given business data from Google Business Profile, return a JSON object
with personalized copy for each section of a demo website.

Return exactly this shape — no extra keys, no explanation, valid JSON only:
{
  "hero": {
    "headline": "Chiropractor in [City], [State] | [Business Name]",
    "subheadline": "Compelling one-sentence promise of patient outcomes."
  },
  "uvp": "One punchy sentence that captures the practice's unique value proposition.",
  "doctor": {
    "name": "Dr. [inferred or generic First Last]",
    "bio": "2-3 sentences about the doctor's background, philosophy, and approach to patient care."
  },
  "conditions": [
    {"name": "Back Pain", "description": "1-2 sentences on how the practice treats this."},
    {"name": "Neck Pain", "description": "1-2 sentences."},
    {"name": "Headaches & Migraines", "description": "1-2 sentences."},
    {"name": "Sciatica", "description": "1-2 sentences."},
    {"name": "Sports Injuries", "description": "1-2 sentences."},
    {"name": "Auto Accident Recovery", "description": "1-2 sentences."}
  ],
  "services": ["Spinal Adjustment", "Massage Therapy", "Corrective Exercises", "Decompression Therapy", "Posture Correction"],
  "about": "2-3 sentence paragraph about the practice, its mission, and its approach.",
  "office": "1-2 sentences describing the office environment and patient experience.",
  "testimonials": [
    {"text": "Realistic patient-style testimonial (1-2 sentences).", "author": "First Name L., City"},
    {"text": "A second realistic testimonial.", "author": "First Name L., City"}
  ],
  "faq": [
    {"question": "What conditions do chiropractors treat?", "answer": "..."},
    {"question": "Does chiropractic adjustment hurt?", "answer": "..."},
    {"question": "How many visits will I need?", "answer": "..."},
    {"question": "Do you accept insurance?", "answer": "..."}
  ],
  "service_area": "One sentence describing the city and surrounding communities served.",
  "cta": "Short call-to-action text (e.g. 'Book Your Free Consultation')"
}

Keep the tone warm, professional, and patient-focused. Use the actual city and state in the hero headline.
If a doctor's name cannot be inferred, use a generic credential like "Dr. Smith" or "our chiropractor".
Never use placeholder text like [City] or [Name] in output — fill in actual values.
Never invent a rating or review count unless provided.
""",
}


def generate_copy(client: Anthropic, lead: dict) -> dict:
    niche = lead.get("niche", "lawn_care")
    system_prompt = SYSTEM_PROMPTS.get(niche, SYSTEM_PROMPTS["lawn_care"])

    message = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=2048,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": (
                f"Business name: {lead['business_name']}\n"
                f"Location: {lead.get('city', '')}, {lead.get('state', '')}\n"
                f"Phone: {lead.get('phone') or 'not listed'}\n"
                f"Address: {lead.get('address') or 'not listed'}\n"
            )
        }]
    )
    text_block = next(b for b in message.content if b.type == "text")
    text = text_block.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    text = text.strip()
    # Claude sometimes outputs trailing commas which are invalid JSON
    text = re.sub(r",\s*([\}\]])", r"\1", text)
    return json.loads(text)
