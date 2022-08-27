resource "aws_cloudfront_cache_policy" "lifelong_cache" {
  name        = "lifelong-cache"
  comment     = "Lifelong cache"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 1
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "lifelong_cache_response" {
  name    = "lifelong-cache-response"
  comment = "Lifelong cache response"

  custom_headers_config {
    items {
      header   = "Cache-Control"
      value    = "max-age=31536000"
      override = false
    }
  }

  security_headers_config {}
}
