#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local"
source $ENV_FILE

urlencode() {
    # urlencode <string>

    old_lc_collate=$LC_COLLATE
    LC_COLLATE=C

    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:$i:1}"
        case $c in
            [a-zA-Z0-9.~_-]) printf '%s' "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done

    LC_COLLATE=$old_lc_collate
}

URL_ENCODED_PIPELINE_PASSWORD=$(urlencode $DB_PIPELINE_PASSWORD)

DATABASE_URL="mysql://$DB_PIPELINE_USER:$URL_ENCODED_PIPELINE_PASSWORD@$DB_HOST:3306/$DB_NAME?schema=public"

if [ "$NO_DB_SSL" != "true" ] && [[ $DB_HOST == *"aws.com" ]]
then
    URL_ENCODED_CERT_PATH=$(urlencode "../aws/eu-west-2-bundle.pem")
    DATABASE_URL="${DATABASE_URL}&sslaccept=strict&sslcert=$URL_ENCODED_CERT_PATH"
fi

env DATABASE_URL=$DATABASE_URL bash -c 'npx prisma db push'