
resource "aws_s3_bucket" "ticklethepanda_gallery" {
  arn            = "arn:aws:s3:::ticklethepanda-gallery"
  bucket         = "ticklethepanda-gallery"
  hosted_zone_id = "Z3GKZC51ZF0DB4"

  provider = aws.eu-west-2
}

data "aws_iam_policy_document" "public_access_ticklethepanda_gallery" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.ticklethepanda_gallery.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "all_object_public_ticklethepanda_gallery" {
  bucket = aws_s3_bucket.ticklethepanda_gallery.id
  policy = data.aws_iam_policy_document.public_access_ticklethepanda_gallery.json

  provider = aws.eu-west-2
}
