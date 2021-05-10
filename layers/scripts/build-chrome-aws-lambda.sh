#!/usr/bin/env bash
set -Ceuo pipefail
cd `dirname $0`/..

mkdir -p dist
cd dist
rm -Rf nodejs

if [ ! -d chrome-aws-lambda ]; then
    git clone --depth=1 https://github.com/alixaxel/chrome-aws-lambda.git
    cd chrome-aws-lambda
else
    cd chrome-aws-lambda
    git checkout 
fi

# build chrome
make chrome_aws_lambda.zip
cd ..
mv chrome-aws-lambda/chrome_aws_lambda.zip ./chrome-aws-lambda.zip
