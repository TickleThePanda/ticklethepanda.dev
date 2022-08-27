terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = ">=4.28"
    }
  }
  cloud {
    organization = "TickleThePanda"
    workspaces {
      name = "ticklethepanda-dev"
    }
  }

  required_version = ">=1.2.8"
}



provider "aws" {
  region = "eu-central-1"

  default_tags {
    tags = {
      TerraformManaged = "True"
    }
  }
}

provider "aws" {
  region = "eu-west-2"

  default_tags {
    tags = {
      TerraformManaged = "True"
    }
  }

  alias = "eu-west-2"
}

resource "aws_s3_bucket" "ticklethepanda_assets" {
  arn            = "arn:aws:s3:::ticklethepanda-assets"
  bucket         = "ticklethepanda-assets"
  hosted_zone_id = "Z21DNDUVLTQW6Q"
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
