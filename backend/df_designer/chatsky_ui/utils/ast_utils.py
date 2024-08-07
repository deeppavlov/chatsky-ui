import ast


def get_imports_from_file(file_path):
    """Gets all imports from a file and returns them as strings separated by newlines.

    Example:
    >>> get_imports_from_file('file.py')
    'import os\nfrom pathlib import Path'
    """
    with open(file_path, "r", encoding="UTF-8") as file:
        node = ast.parse(file.read(), file_path)

    imports = []
    for item in ast.walk(node):
        if isinstance(item, ast.Import):
            for alias in item.names:
                if alias.asname:
                    imports.append(f"import {alias.name} as {alias.asname}")
                else:
                    imports.append(f"import {alias.name}")
        elif isinstance(item, ast.ImportFrom):
            module = item.module if item.module else ""
            for alias in item.names:
                if alias.asname:
                    imports.append(f"from {module} import {alias.name} as {alias.asname}")
                else:
                    imports.append(f"from {module} import {alias.name}")

    return "\n".join(imports)
