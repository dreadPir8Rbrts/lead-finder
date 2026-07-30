import json
from anthropic import Anthropic

SYSTEM_PROMPT = """
You are writing website copy for a lawn care business.
Given business data from Google Business Profile, return a JSON object
with personalized copy for each section of a demo website.

Return exactly this shape — no extra keys, no explanation, valid JSON only:
{
  "hero": {
    "headline": "...",
    "subheadline": "..."
  },
  "services": ["Service 1", "Service 2", "Service 3"],
  "about": "2-3 sentence paragraph about the business.",
  "service_area": "One sentence describing the city and surrounding area served.",
  "cta": "Short call-to-action text (e.g. 'Get a Free Quote Today')"
}

Keep the tone professional and local. Never invent a rating or review count
unless it is provided. Never use placeholder text like [City] or [Name].
"""


def generate_copy(client: Anthropic, lead: dict) -> dict:
    message = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
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
    return json.loads(message.content[0].text)
