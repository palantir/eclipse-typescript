#!/bin/bash

set -e

# update the TypeScript code and build
(
  cd ../TypeScript
  git fetch
  git checkout origin/release-2.1
  rm -rf built/local
  jake clean
  jake local
)

# copy the necessary bin files to build
cp ../Typescript/bin/tsc $(dirname $0)/../com.palantir.typescript/bridge/bin/
cp ../Typescript/built/local/lib.d.ts $(dirname $0)/../com.palantir.typescript/bridge/lib/
cp ../Typescript/built/local/tsc.js $(dirname $0)/../com.palantir.typescript/bridge/lib/

# copy the language services JavaScript and definition file
cp ../Typescript/built/local/typescriptServices.js $(dirname $0)/../com.palantir.typescript/bridge/lib/
cp ../Typescript/built/local/typescriptServices.d.ts $(dirname $0)/../com.palantir.typescript/bridge/typings/

# copy the default lib files into the plug-in
cp ../Typescript/built/local/lib.d.ts $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/
cp ../Typescript/built/local/lib.es6.d.ts $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/

# convert to unix line endings
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/lib.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/tsc.js
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/lib/typescriptServices.js
dos2unix $(dirname $0)/../com.palantir.typescript/bridge/typings/typescriptServices.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/lib.d.ts
dos2unix $(dirname $0)/../com.palantir.typescript/src/com/palantir/typescript/services/language/lib.es6.d.ts
