#!/bin/bash

# Script to update all references to the old directory name to the new one
# across the project files.

# Define the old and new directory names
OLD_NAME="AIM"
NEW_NAME="AIM"

# Define the project directory (update this to your actual path)
PROJECT_DIR="/Users/nathanwilliams/Documents/AIM"

# Backup the project directory before making changes
echo "Creating a backup of the project directory..."
cp -r "$PROJECT_DIR" "$PROJECT_DIR.bak"

# Find all text files containing the old name
echo "Searching for files containing the old directory name..."
FILES=$(find "$PROJECT_DIR" -type f -exec grep -l "$OLD_NAME" {} \; 2>/dev/null)

# Update each file
for FILE in $FILES; do
    # Check if the file is a text file
    if file "$FILE" | grep -q "text"; then
        echo "Updating $FILE..."
        sed -i '' "s/$OLD_NAME/$NEW_NAME/g" "$FILE"
    else
        echo "Skipping non-text file: $FILE"
    fi
done

echo "Update complete. Please test your project."
echo "A backup of the original directory is saved at $PROJECT_DIR.bak"
