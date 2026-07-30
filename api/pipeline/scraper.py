"""
GBP scraper — implement after choosing Outscraper or DataForSEO.

The returned dicts are consumed by filters.py. Once you have the real API
response format, update the field names in filters.py to match:
  name, city, state, full_address, email, phone, site,
  categories, place_link, updated_at, country_code
"""


def scrape_gbp(filters: dict) -> list[dict]:
    """
    Pull GBP listings from Outscraper or DataForSEO.

    filters keys: niche, city, state, radius_km
    """
    raise NotImplementedError(
        "Implement scraper before running the pipeline. "
        "See https://outscraper.com/google-maps-scraper/ or https://dataforseo.com/"
    )
