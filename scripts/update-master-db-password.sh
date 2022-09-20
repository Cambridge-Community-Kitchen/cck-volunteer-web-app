#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ENV_FILE="$SCRIPT_DIR/../.env.local" 

source $ENV_FILE
sudo mysql --defaults-file=/etc/mysql/debian.cnf --database="mysql" --execute="ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_MASTER_PASSWORD}';"

echo "MySQL root user's password successfully updated based on contents of the .env.local file"