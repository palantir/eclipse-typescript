#!/bin/bash

if [ "$#" != 2 ]; then
    Echo "Usage: update_version x.y.z a.b.c"
    exit 1
fi

Echo "version ${1} will be renamed ${2}"

read -p "Press enter to continue or CTRL+C to abort"

sed_string="s/${1}.qualifier/${2}.qualifier/g"
echo SED: ${sed_string}
find .. -name '*.xml' -o -name '*.MF' -exec sed -i ${sed_string} {} \;