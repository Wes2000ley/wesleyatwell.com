import os
from pathlib import Path
import argparse
import sys

def rename_folders(root_dir, dry_run=False):
    """
    Recursively rename folders by replacing underscores with spaces.
    
    Parameters:
    - root_dir (Path): The root directory to start renaming from.
    - dry_run (bool): If True, print the actions without renaming.
    """
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
        for dirname in dirnames:
            current_path = Path(dirpath) / dirname
            new_dirname = dirname.replace('_', ' ')
            if new_dirname != dirname:
                new_path = Path(dirpath) / new_dirname
                if new_path.exists():
                    print(f"⚠️  Skipping renaming '{current_path}' because '{new_path}' already exists.")
                else:
                    if dry_run:
                        print(f"🔍 [Dry Run] Would rename: '{current_path}' -> '{new_path}'")
                    else:
                        try:
                            current_path.rename(new_path)
                            print(f"✅ Renamed: '{current_path}' -> '{new_path}'")
                        except Exception as e:
                            print(f"❌ Failed to rename '{current_path}': {e}")

def main():
    parser = argparse.ArgumentParser(description="Rename all folders below a specified directory by replacing underscores with spaces.")
    parser.add_argument('directory', type=str, help='Path to the root directory.')
    parser.add_argument('--dry-run', action='store_true', help='Perform a dry run without renaming folders.')
    args = parser.parse_args()

    root_dir = Path(args.directory)

    if not root_dir.exists():
        print(f"❌ The directory '{root_dir}' does not exist.")
        sys.exit(1)
    if not root_dir.is_dir():
        print(f"❌ The path '{root_dir}' is not a directory.")
        sys.exit(1)

    if args.dry_run:
        print(f"🔍 Starting a dry run to rename folders in '{root_dir}'...\n")
    else:
        print(f"🔍 Starting to rename folders in '{root_dir}'...\n")
        
    rename_folders(root_dir, dry_run=args.dry_run)
    
    if args.dry_run:
        print("\n✅ Dry run completed. No folders were renamed.")
    else:
        print("\n✅ Renaming process completed.")

if __name__ == "__main__":
    main()
