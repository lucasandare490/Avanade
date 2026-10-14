#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
: "${DEMO_PASSWORD:?Defina DEMO_PASSWORD com 12 a 72 caracteres}"
./mvnw -q test-compile dependency:build-classpath -Dmdep.outputFile=target/local-classpath.txt -Dmdep.includeScope=test
export DEBUG=false TRACE=false
exec java -cp "target/test-classes:target/classes:$(cat target/local-classpath.txt)" br.com.avanade.split.LocalDemo
