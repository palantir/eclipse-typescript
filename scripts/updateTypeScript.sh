#!/bin/bash

set -e

# update the TypeScript code and build
(
  cd ../typescript
  git checkout release-1.4
  git pull
  rm -rf built/local
  jake local
)

# copy the necessary bin files to build
cp ../typescript/bin/lib.d.ts $(dirname $0)/../Bridge/bin/
cp ../typescript/bin/tsc $(dirname $0)/../Bridge/bin/
cp ../typescript/bin/tsc.js $(dirname $0)/../Bridge/bin/

# copy the language services JavaScript and definition file
cp ../typescript/built/local/typescriptServices.js $(dirname $0)/../Bridge/lib/
cp ../typescript/built/local/typescriptServices.d.ts $(dirname $0)/../Bridge/typings/
