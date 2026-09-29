import re
import secrets

NICHE_KEYWORDS: dict[str, set[str]] = {
    "lawn_care": {"lawn", "landscap", "mow", "grass", "turf", "garden", "yard", "sprinkler"},
    "chiropractor": {"chiro", "chiropract", "spine", "spinal", "adjust", "chiropractic"},
}

ACTIVE_STATUSES = {"OPERATIONAL", "CLOSED_TEMPORARILY"}


def passes_hard_filters(lead: dict, niche: str = "lawn_care") -> bool:
    if lead.get("website"):
        return False

    keywords = NICHE_KEYWORDS.get(niche, NICHE_KEYWORDS["lawn_care"])
    type_str = lead.get("type", "") or lead.get("category", "") or ""
    subtypes_str = lead.get("subtypes", "") or ""
    categories = f"{type_str} {subtypes_str}".lower()
    if not any(kw in categories for kw in keywords):
        return False

    status = lead.get("business_status", "OPERATIONAL")
    if status == "CLOSED_PERMANENTLY":
        return False

    if lead.get("country_code", "US").upper() != "US":
        return False

    return True


def score_lead(lead: dict) -> int:
    return sum([
        bool(lead.get("address")),
        bool(lead.get("email")),
        bool(lead.get("phone")),
    ])


def filter_and_score(raw_leads: list[dict], niche: str = "lawn_care") -> list[dict]:
    results = []
    for lead in raw_leads:
        if not passes_hard_filters(lead, niche):
            continue
        lead["lead_score"] = score_lead(lead)
        results.append(lead)
    return sorted(results, key=lambda x: x["lead_score"], reverse=True)


def make_slug(business_name: str, city: str = "", state: str = "") -> str:
    raw = f"{business_name}-{city}-{state}".lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw).strip("-")
    suffix = secrets.token_hex(3)  # 6-char suffix prevents collisions
    return f"{slug[:70]}-{suffix}"
