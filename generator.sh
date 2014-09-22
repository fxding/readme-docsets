#!/bin/sh

if [ $# -lt 1 ]; then
  echo 'Pleace enter the docset name'
  exit 0
fi


SQLITE=sqlite3
DOCSET="${1}.docset"
DOCSET_FOLDER="${1}.docset/Contents/Resources/Documents/"
CONTENTS_FOLDER="${1}.docset/Contents/"
RESOURCE_FOLDER="${1}.docset/Contents/Resources/"

# Get README files and generate relevant pages
node app

# Create docset directory
rm -rf $DOCSET
mkdir -p ${DOCSET_FOLDER}

# Copy files
cp -r pages $DOCSET_FOLDER
cp -r index.html $DOCSET_FOLDER
cp -r Info.plist $CONTENTS_FOLDER

cp -r table.sql $RESOURCE_FOLDER
cp -r index.sql $RESOURCE_FOLDER

# Create search index
cd $RESOURCE_FOLDER
$SQLITE docSet.dsidx << EOF
.read table.sql
.read index.sql
EOF

# Open it
cd -
#open $DOCSET

