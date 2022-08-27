resource "aws_acm_certificate" "ticklethepanda_certs" {
  provider = aws.us-east-1

  domain_name               = "*.ticklethepanda.dev"
  subject_alternative_names = ["*.ticklethepanda.co.uk"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}
