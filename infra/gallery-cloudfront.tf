locals {
  s3_origin_id_gallery     = "S3-ticklethepanda-gallery/dist"
  s3_origin_path_gallery   = "/dist"
  managed_cors_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
  managed_caching_disabled = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
}

resource "aws_cloudfront_distribution" "ticklethepanda_gallery" {
  origin {
    domain_name = aws_s3_bucket.ticklethepanda_gallery.bucket_domain_name
    origin_id   = local.s3_origin_id_gallery
    origin_path = local.s3_origin_path_gallery
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "galleries.ticklethepanda.dev"
  default_root_object = "galleries.json"

  aliases = ["galleries.ticklethepanda.dev", "galleries.ticklethepanda.co.uk"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id_gallery

    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = aws_cloudfront_cache_policy.lifelong_cache.id
    origin_request_policy_id   = local.managed_cors_policy_id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.lifelong_cache_response.id
  }

  ordered_cache_behavior {
    path_pattern     = "galleries.json"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id_gallery

    cache_policy_id = local.managed_caching_disabled

    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id_gallery

    cache_policy_id = local.managed_caching_disabled

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
