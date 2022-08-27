
resource "aws_s3_bucket" "ticklethepanda_gallery_originals" {
  bucket = "film-photography-originals"
}

resource "aws_s3_bucket_public_access_block" "ticklethepanda_gallery_originals_block" {
  bucket = aws_s3_bucket.ticklethepanda_gallery_originals.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
