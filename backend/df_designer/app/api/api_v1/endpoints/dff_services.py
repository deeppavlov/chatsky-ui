import re
from io import StringIO
from typing import Optional

import aiofiles
from fastapi import APIRouter, Depends
from pylint.lint import Run, pylinter
from pylint.reporters.text import TextReporter

from app.api.deps import get_index
from app.clients.dff_client import get_dff_conditions
from app.core.config import settings
from app.core.logger_config import get_logger
from app.schemas.code_snippet import CodeSnippet
from app.services.index import Index
from app.utils.ast_utils import get_imports_from_file

router = APIRouter()

logger = get_logger(__name__)


@router.get("/search/{service_name}", status_code=200)
async def search_service(service_name: str, index: Index = Depends(get_index)) -> dict[str, str | Optional[list]]:
    """Searches for a custom service by name and returns its code.

    A service could be a condition, reponse, or pre/postservice.
    """
    response = await index.search_service(service_name)
    return {"status": "ok", "data": response}


@router.post("/lint_snippet", status_code=200)
async def lint_snippet(snippet: CodeSnippet) -> dict[str, str]:
    """Lints a snippet with Pylint.

    This endpoint Joins the snippet with all imports existing in the conditions.py file and then runs Pylint on it.
    """
    code_snippet = snippet.code.replace(r"\n", "\n")

    imports = get_imports_from_file(settings.snippet2lint_path.parent / "conditions.py")
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
async def get_conditions() -> dict[str, str | list]:
    """Gets the dff's out-of-the-box conditions."""
    return {"status": "ok", "data": get_dff_conditions()}
