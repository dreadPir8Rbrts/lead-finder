import unittest
from unittest.mock import patch

import httpx

from api.pipeline.logos import resolve_logo_url


class LogoResolutionTests(unittest.TestCase):
    source = "https://lh4.googleusercontent.com/example/s44-p-k-no-ns-nd/photo.jpg"
    larger = "https://lh4.googleusercontent.com/example/s256-p-k-no-ns-nd/photo.jpg"

    @patch("api.pipeline.logos.httpx.get")
    def test_missing_logo_does_not_fetch(self, get):
        for source in [None, "", "   "]:
            self.assertIsNone(resolve_logo_url(source))
        get.assert_not_called()

    @patch("api.pipeline.logos.httpx.get")
    def test_prefers_working_larger_image(self, get):
        get.return_value = httpx.Response(200, headers={"content-type": "image/png"})
        self.assertEqual(resolve_logo_url(self.source), self.larger)
        self.assertEqual(get.call_count, 1)

    @patch("api.pipeline.logos.httpx.get")
    def test_original_image_is_fallback(self, get):
        get.side_effect = [httpx.Response(404), httpx.Response(200, headers={"content-type": "image/jpeg"})]
        self.assertEqual(resolve_logo_url(self.source), self.source)
        self.assertEqual([call.args[0] for call in get.call_args_list], [self.larger, self.source])

    @patch("api.pipeline.logos.httpx.get")
    def test_failed_url_is_preserved_for_admin(self, get):
        get.side_effect = httpx.ConnectError("Image unavailable")
        self.assertEqual(resolve_logo_url(self.source), self.source)

    @patch("api.pipeline.logos.httpx.get")
    def test_html_response_is_not_accepted_as_larger_logo(self, get):
        get.return_value = httpx.Response(200, headers={"content-type": "text/html"})
        self.assertEqual(resolve_logo_url(self.source), self.source)


if __name__ == "__main__":
    unittest.main()
