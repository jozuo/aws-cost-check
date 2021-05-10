#!/usr/bin/env bash
set -xCeuo pipefail
cd `dirname $0`

for email in "$@"
do
    echo ${email}
    aws ses verify-email-identity \
        --email-address ${email}
done

