import re
from io import StringIO
from typing import Dict, Union

import aiofiles
from fastapi import APIRouter
from pylint.lint import Run, pylinter
from pylint.reporters.text import TextReporter

from chatsky_ui.clients.chatsky_client import get_chatsky_conditions
from chatsky_ui.core.config import settings
from chatsky_ui.schemas.code_snippet import CodeSnippet
from chatsky_ui.services.json_converter.logic_component_converter.service_replacer import get_all_classes
from chatsky_ui.utils.ast_utils import get_imports_from_file

router = APIRouter()


@router.get("/search/condition/{condition_name}", status_code=200)
async def search_condition(condition_name: str) -> Dict[str, Union[str, list]]:
    """Searches for a custom condition by name and returns its code."""
    custom_classes = get_all_classes(settings.conditions_path)
    response = [custom_class["body"] for custom_class in custom_classes if custom_class["name"] == condition_name]
    return {"status": "ok", "data": response}


@router.get("/get_all_custom_conditions", status_code=200)
async def get_all_custom_conditions_names() -> Dict[str, Union[str, list]]:
    all_classes = get_all_classes(settings.conditions_path)
    custom_classes = [custom_class["body"] for custom_class in all_classes]
    return {"status": "ok", "data": custom_classes}


@router.post("/lint_snippet", status_code=200)
async def lint_snippet(snippet: CodeSnippet) -> Dict[str, str]:
    """Lints a snippet with Pylint.

    This endpoint Joins the snippet with all imports existing in the conditions.py file and then runs Pylint on it.
    """
    code_snippet = snippet.code.replace(r"\n", "\n")

    imports = get_imports_from_file(settings.conditions_path)
    code_snippet = "\n\n".join([imports, code_snippet])

    async with aiofiles.open(settings.snippet2lint_path, "wt", encoding="UTF-8") as file:
        await file.write(code_snippet)

    pylint_output = StringIO()
    reporter = TextReporter(pylint_output)
    Run([str(settings.snippet2lint_path), "--disable=W,I,R,C"], reporter=reporter, exit=False)

    error = pylint_output.getvalue()
    if re.search(r": E\d{4}:", error):
        response = {"status": "error", "message": error}
    else:
        response = {"status": "ok", "message": ""}
    pylinter.MANAGER.clear_cache()
    return response


@router.get("/get_conditions", status_code=200)
async def get_conditions() -> Dict[str, Union[str, list]]:
    """Gets the chatsky's out-of-the-box conditions."""
    return {"status": "ok", "data": get_chatsky_conditions()}
