#!/usr/bin/env bash
set -Ceuo pipefail
cd `dirname $0`

service=$(cat ../serverless.yml | yq -r .service)
stage=local
endpoint=http://localhost:4566

# SSM
## MANAGED_CONSOLE_URL
aws ssm put-parameter \
    --endpoint-url ${endpoint} \
    --overwrite \
    --cli-input-json "{
  \"Name\": \"/${service}/${stage}/MANAGED_CONSOLE_URL\",
  \"Value\": \"${MANAGED_CONSOLE_URL}\",
  \"Type\": \"String\"
}"

## MANAGED_CONSOLE_USER
aws ssm put-parameter \
    --endpoint-url ${endpoint} \
    --overwrite \
    --cli-input-json "{
  \"Name\": \"/${service}/${stage}/MANAGED_CONSOLE_USER\",
  \"Value\": \"${MANAGED_CONSOLE_USER}\",
  \"Type\": \"SecureString\"
}"

## MANAGED_CONSOLE_PASSWORD
aws ssm put-parameter \
    --endpoint-url ${endpoint} \
    --overwrite \
    --cli-input-json "{
  \"Name\": \"/${service}/${stage}/MANAGED_CONSOLE_PASSWORD\",
  \"Value\": \"${MANAGED_CONSOLE_PASSWORD}\",
  \"Type\": \"SecureString\"
}"

# SES
aws ses verify-email-identity \
    --endpoint-url ${endpoint} \
    --email-address luke.and.chase@gmail.com
    
aws ses verify-email-identity \
    --endpoint-url ${endpoint} \
    --email-address luke.da.wan@gmail.com
    
aws ses verify-email-identity \
    --endpoint-url ${endpoint} \
    --email-address jozuo.dev@gmail.com
    
aws ses verify-email-identity \
    --endpoint-url ${endpoint} \
    --email-address mori.toru4@exc.epson.co.jp
    
# DynamoDB
aws dynamodb create-table \
    --endpoint-url ${endpoint} \
    --table-name ${service}-${stage} \
    --attribute-definitions \
        AttributeName=kind,AttributeType=S \
        AttributeName=date,AttributeType=S \
    --key-schema \
        AttributeName=kind,KeyType=HASH AttributeName=date,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=1,WriteCapacityUnits=1 
         
# S3
 aws s3 mb \
    --endpoint-url ${endpoint} \
     s3://${service}-${stage}

