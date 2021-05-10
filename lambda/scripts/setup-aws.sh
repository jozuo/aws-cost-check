#!/usr/bin/env bash
set -Ceuo pipefail
cd `dirname $0`

service=$(cat ../serverless.yml | yq -r .service)
stage=${STAGE}

# SSM
## MANAGED_CONSOLE_URL
aws ssm put-parameter \
    --overwrite \
    --cli-input-json "{
  \"Name\": \"/${service}/${stage}/MANAGED_CONSOLE_URL\",
  \"Value\": \"${MANAGED_CONSOLE_URL}\",
  \"Type\": \"String\"
}"

## MANAGED_CONSOLE_USER
aws ssm put-parameter \
    --overwrite \
    --cli-input-json "{
  \"Name\": \"/${service}/${stage}/MANAGED_CONSOLE_USER\",
  \"Value\": \"${MANAGED_CONSOLE_USER}\",
  \"Type\": \"SecureString\"
}"

## MANAGED_CONSOLE_PASSWORD
aws ssm put-parameter \
    --overwrite \
    --cli-input-json "{
  \"Name\": \"/${service}/${stage}/MANAGED_CONSOLE_PASSWORD\",
  \"Value\": \"${MANAGED_CONSOLE_PASSWORD}\",
  \"Type\": \"SecureString\"
}"

