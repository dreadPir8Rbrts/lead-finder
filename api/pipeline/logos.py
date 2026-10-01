import re
from typing import Optional
import httpx

# Google image URLs carry their size in the path (e.g. /s44-p-k-no-ns-nd/); Outscraper returns
# 44px versions, which look blurry in the header, so ask for a larger one.
GOOGLE_SIZE_RE = re.compile(r"/s\d+(-[a-z-]+)?/")
LOGO_SIZE = 256


def usable_logo_url(url: Optional[str]) -> Optional[str]:
    """Return a higher-res logo URL if it actually serves an image, else None.

    Outscraper's `logo` is often a legacy Google profile-photo link that now 404s.
    """
    if not url:
        return None
    if "googleusercontent.com" in url:
        url = GOOGLE_SIZE_RE.sub(lambda m: f"/s{LOGO_SIZE}{m.group(1) or ''}/", url, count=1)
    try:
        resp = httpx.get(url, timeout=5, follow_redirects=True)
    except httpx.HTTPError:
        return None
    if resp.status_code != 200 or not resp.headers.get("content-type", "").startswith("image/"):
        return None
    return url
