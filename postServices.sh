#!/bin/bash
#
# Copyright 2022 Jérôme Gasperi
#
# Licensed under the Apache License, version 2.0 (the "License");
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at:
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

###### DO NOT TOUCH DEFAULT VALUES ########
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

DATA_DIR=__NULL__
AUTH_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqanJvbS9oZWFsdGhjaGVja3IiLCJpYXQiOjE2Njg1ODg2MjQsImV4cCI6MjAxNTc0MzgyNCwiYXVkIjoibG9jYWxob3N0Iiwic3ViIjoiMTAwIn0.B22VwW1hSkMh4nFgS9KHDCcpIFEqv2CfH6P39lJ-9EA
############################################

function showUsage {
    echo ""
    echo "   Healthcheckr post services example script"
    echo ""
    echo "   Usage $0 -d <services_directory> -a <auth_token>"
    echo ""
    echo "      -d | --dataDir Directory containing service description files (i.e. json files)"
    echo "      -a | --authToken Authentication token (i.e. JWT)"
    echo "      -h | --help show this help"
    echo ""
}

# Parsing arguments
while [[ $# > 0 ]]
do
	key="$1"
	case $key in
        -d|--dataDir)
            DATA_DIR="$2"
            shift # past argument
            ;;
        -a|--authToken)
            AUTH_TOKEN="$2"
            shift # past argument
            ;;
        -h|--help)
            showUsage
            exit 0
            shift # past argument
            ;;
            *)
        shift # past argument
        # unknown option
        ;;
	esac
done

if [ ! -d ${DATA_DIR} ]; then
    showUsage
    echo -e "${RED}[ERROR]${NC} Directory ${DATA_DIR} does not exist"
    echo ""
    exit 0
fi

for service in ${DATA_DIR}/*.json; do
    curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${AUTH_TOKEN}" -d @${service} "http://localhost:4111/services"
    echo ""
done
 