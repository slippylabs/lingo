import os
import shutil
import click  # type: ignore

@click.command()
@click.argument("source_directory")
@click.argument("destination_directory")
def copy_and_rename_files(source_directory: str, destination_directory: str):
    # Check if the source directory exists
    if not os.path.exists(source_directory):
        print(f"The source directory '{source_directory}' does not exist.")
        return

    # Create the destination directory if it does not exist
    os.makedirs(destination_directory, exist_ok=True)

    # Iterate over all folders in the source directory
    for folder_name in os.listdir(source_directory):
        # Skip the .git folder
        if folder_name == '.git':
            continue
        folder_path = os.path.join(source_directory, folder_name)

        # Ensure it is a directory
        if os.path.isdir(folder_path):
            # Iterate over files in the folder
            for file_name in os.listdir(folder_path):
                file_path = os.path.join(folder_path, file_name)

                # Ensure it is a file
                if os.path.isfile(file_path):
                    # Build the new file name
                    new_file_name = f"librelingo__{folder_name}__{file_name}"
                    destination_path = os.path.join(destination_directory, new_file_name)

                    # Copy the file to the destination directory
                    shutil.copy2(file_path, destination_path)
                    # print(f"Copied: {file_path} -> {destination_path}")

if __name__ == "__main__":
    copy_and_rename_files()