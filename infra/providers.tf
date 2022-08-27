terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=4.28"
    }
  }
  cloud {
    organization = "TickleThePanda"
    workspaces {
      name = "ticklethepanda-dev"
    }
  }

  required_version = ">=1.2.7"
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

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      TerraformManaged = "True"
    }
  }

  alias = "us-east-1"
}


