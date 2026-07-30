from outscraper import ApiClient
from ..config import settings


def scrape_gbp(filters: dict) -> list[dict]:
    """
    Pull Google Business Profile listings via Outscraper.

    filters keys: niche, city, state, limit (default 100)

    Outscraper returns a list-of-lists (one inner list per query).
    We pass a single query, so we unwrap results[0].
    """
    client = ApiClient(api_key=settings.outscraper_api_key)

    niche_query = filters.get("niche", "lawn_care").replace("_", " ")
    city = filters.get("city", "")
    state = filters.get("state", "")
    limit = filters.get("limit", 100)

    query = " ".join(part for part in [niche_query, city, state] if part)

    results = client.google_maps_search(
        query,
        limit=limit,
        language="en",
        region="us",
    )

    if not results or not results[0]:
        return []

    return results[0]
