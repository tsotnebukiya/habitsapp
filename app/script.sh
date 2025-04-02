#!/bin/bash

# Use this script to add comments to all .ts and .tsx files in the app directory
# Recursively find all .ts and .tsx files in the current directory
find . -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Get the relative file path and convert it to a comment
  relative_path="${file#./}"
  comment="// app/${relative_path}"

  # Read the first line of the file
  first_line=$(head -n 1 "$file")

  # Check if the first line is already the comment
  if [ "$first_line" != "$comment" ]; then
    # Add the comment at the top of the file
    (echo "$comment" && cat "$file") > temp_file && mv temp_file "$file"
    echo "Added comment to $file"
  else
    echo "Comment already exists in $file"
  fi
done
