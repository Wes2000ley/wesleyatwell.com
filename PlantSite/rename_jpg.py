import os
from pathlib import Path
import argparse
import sys

def rename_files(root_dir, dry_run=False):
    """
    Recursively rename .jpeg and .JPG files to .jpg in the specified directory.

    Parameters:
    - root_dir (Path): The root directory to start renaming from.
    - dry_run (bool): If True, perform a dry run without renaming files.
    """
    # Counter variables
    total_files = 0
    renamed_files = 0
    skipped_files = 0
    error_files = 0

    print(f"{'Dry Run: ' if dry_run else ''}Starting to rename files in '{root_dir}'\n")

    # Traverse the directory tree
    for file_path in root_dir.rglob('*'):
        try:
            # Ensure it's a file
            if not file_path.is_file():
                continue

            # Get the file extension in lowercase
            suffix_lower = file_path.suffix.lower()

            # Initialize target_path as None
            target_path = None

            # Check for .jpeg extension
            if suffix_lower == '.jpeg':
                target_path = file_path.with_suffix('.jpg')
            # Check for .jpg extensions with different cases (e.g., .JPG, .Jpg)
            elif suffix_lower == '.jpg' and file_path.suffix != '.jpg':
                target_path = file_path.with_suffix('.jpg')

            # If the file needs to be renamed
            if target_path:
                total_files += 1

                # Check if the target file already exists
                if target_path.exists():
                    print(f"⚠️  Skipping '{file_path}' because '{target_path.name}' already exists.")
                    skipped_files += 1
                    continue

                if dry_run:
                    print(f"🔍 [Dry Run] Would rename: '{file_path}' -> '{target_path}'")
                else:
                    file_path.rename(target_path)
                    print(f"✅ Renamed: '{file_path}' -> '{target_path}'")
                    renamed_files += 1

        except Exception as e:
            print(f"❌ Failed to rename '{file_path}': {e}")
            error_files += 1

    # Summary
    print("\n" + "="*50)
    print(f"Total files processed: {total_files}")
    if dry_run:
        print(f"Total files that would be renamed: {renamed_files}")
    else:
        print(f"Total files renamed: {renamed_files}")
    print(f"Total files skipped: {skipped_files}")
    if error_files > 0:
        print(f"Total files with errors: {error_files}")
    print("="*50)

def main():
    parser = argparse.ArgumentParser(
        description="Recursively rename .jpeg and .JPG files to .jpg in a specified directory."
    )
    parser.add_argument(
        'directory',
        type=str,
        help='Path to the root directory where renaming should begin.'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Perform a dry run without renaming any files.'
    )

    args = parser.parse_args()

    root_dir = Path(args.directory)

    # Validate the root directory
    if not root_dir.exists():
        print(f"❌ The directory '{root_dir}' does not exist.")
        sys.exit(1)
    if not root_dir.is_dir():
        print(f"❌ The path '{root_dir}' is not a directory.")
        sys.exit(1)

    rename_files(root_dir, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
