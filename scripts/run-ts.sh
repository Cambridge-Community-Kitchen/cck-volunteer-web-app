#!/usr/bin/env bash

ts-node -P ./scripts.tsconfig.json $1 "${@:2}"