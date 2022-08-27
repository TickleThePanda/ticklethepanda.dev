
resource "aws_s3_bucket" "ticklethepanda_assets" {
  bucket = "ticklethepanda-assets"
}

data "aws_iam_policy_document" "public_access_ticklethepanda_assets" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.ticklethepanda_assets.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "all_object_public_ticklethepanda_assets" {
  bucket = aws_s3_bucket.ticklethepanda_assets.id
  policy = data.aws_iam_policy_document.public_access_ticklethepanda_assets.json
}
