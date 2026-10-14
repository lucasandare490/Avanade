#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
export DEBUG=false TRACE=false
./mvnw -B verify
./mvnw -B dependency:tree -DoutputFile=target/dependencies.txt
