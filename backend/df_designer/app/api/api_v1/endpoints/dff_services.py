from io import StringIO

import aiofiles
from fastapi import APIRouter, Depends
from pylint.lint import Run
from pylint.reporters.text import TextReporter

from app.api.deps import get_index
from app.core.config import settings
from app.core.logger_config import get_logger
from app.services.index import Index
from app.utils.ast_utils import get_imports_from_file

router = APIRouter()

logger = get_logger(__name__)


@router.get("/search/{service_name}", status_code=200)
async def search_service(service_name: str, index: Index = Depends(get_index)):
    response = await index.search_service(service_name)
    return response


@router.get("/refresh_index", status_code=200)
async def refresh_index(index: Index = Depends(get_index)):
    await index.load()
    return {"status": "ok"}


@router.post("/lint_snippet", status_code=200)
async def lint_snippet(snippet: str) -> str:
    """Lints a snippet with Pylint.

    This endpoint Joins the snippet with all imports existing in the conditions.py file and then runs Pylint on it.
    """
    imports = get_imports_from_file(settings.snippet2lint_path.parent / "conditions.py")
    snippet = "\n\n".join([imports, snippet])

    async with aiofiles.open(settings.snippet2lint_path, "w", encoding="UTF-8") as file:
        await file.write(snippet)

    pylint_output = StringIO()
    reporter = TextReporter(pylint_output)
    Run([str(settings.snippet2lint_path), "--disable=W,I,R,C"], reporter=reporter, exit=False)

    return pylint_output.getvalue()
