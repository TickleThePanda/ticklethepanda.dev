locals {
  s3_origin_id_assets = "S3-ticklethepanda-assets"
}

resource "aws_cloudfront_distribution" "ticklethepanda_images" {
  origin {
    domain_name = aws_s3_bucket.ticklethepanda_assets.bucket_domain_name
    origin_id   = local.s3_origin_id_assets
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "images.ticklethepanda.dev"

  aliases = ["images.ticklethepanda.dev", "images.ticklethepanda.co.uk"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id_assets

    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = aws_cloudfront_cache_policy.lifelong_cache.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.lifelong_cache_response.id
  }

  # Cache behavior with precedence 0
  ordered_cache_behavior {
    path_pattern     = "/location-history/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id_assets

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 604800
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.ticklethepanda_certs.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }
}
