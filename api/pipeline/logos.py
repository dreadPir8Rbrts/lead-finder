import re
from typing import Optional
import httpx

# Google image URLs carry their size in the path (e.g. /s44-p-k-no-ns-nd/); Outscraper returns
# 44px versions, which look blurry in the header, so ask for a larger one.
GOOGLE_SIZE_RE = re.compile(r"/s\d+(-[a-z-]+)?/")
LOGO_SIZE = 256


def resolve_logo_url(url: Optional[str]) -> Optional[str]:
    """Prefer a working higher-res image, retaining the source on failure.

    Retain failed URLs so the admin can distinguish missing logos from broken ones.
    The browser hides broken images on demos and reports their status in admin.
    """
    if not url or not url.strip():
        return None
    url = url.strip()
    larger_url = url
    try:
        host = httpx.URL(url).host
    except httpx.InvalidURL:
        return url
    if host == "googleusercontent.com" or host.endswith(".googleusercontent.com"):
        larger_url = GOOGLE_SIZE_RE.sub(lambda m: f"/s{LOGO_SIZE}{m.group(1) or ''}/", url, count=1)
    for candidate in dict.fromkeys([larger_url, url]):
        try:
            resp = httpx.get(candidate, timeout=5, follow_redirects=True)
        except (httpx.HTTPError, httpx.InvalidURL):
            continue
        if resp.status_code == 200 and resp.headers.get("content-type", "").startswith("image/"):
            return candidate
    return url
