import re
import secrets
from datetime import datetime, timedelta

LAWN_CARE_KEYWORDS = {"lawn", "landscap", "mow", "grass", "turf", "garden", "yard", "sprinkler"}


def passes_hard_filters(lead: dict) -> bool:
    # 1. No website
    if lead.get("site"):
        return False

    # 2. Niche match — adjust field name to match actual API response
    categories = " ".join(lead.get("categories", [])).lower()
    if not any(kw in categories for kw in LAWN_CARE_KEYWORDS):
        return False

    # 3. Recent activity within 12 months — adjust field names to match API response
    activity_raw = lead.get("updated_at") or lead.get("last_review_date")
    if activity_raw:
        cutoff = datetime.now() - timedelta(days=365)
        try:
            activity = datetime.fromisoformat(str(activity_raw).replace("Z", "+00:00"))
            if activity.replace(tzinfo=None) < cutoff:
                return False
        except (ValueError, TypeError):
            pass  # can't parse date — don't filter out

    # 4. US-based — adjust field name to match API response
    country = lead.get("country_code", "US").upper()
    if country != "US":
        return False

    return True


def score_lead(lead: dict) -> int:
    # Field names here must match the raw API response — adjust after choosing Outscraper/DataForSEO
    return sum([
        bool(lead.get("full_address")),
        bool(lead.get("email")),
        bool(lead.get("phone")),
    ])


def filter_and_score(raw_leads: list[dict]) -> list[dict]:
    results = []
    for lead in raw_leads:
        if not passes_hard_filters(lead):
            continue
        lead["lead_score"] = score_lead(lead)
        results.append(lead)
    return sorted(results, key=lambda x: x["lead_score"], reverse=True)


def make_slug(business_name: str, city: str = "", state: str = "") -> str:
    raw = f"{business_name}-{city}-{state}".lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw).strip("-")
    suffix = secrets.token_hex(3)  # 6-char suffix to prevent collisions
    return f"{slug[:70]}-{suffix}"
