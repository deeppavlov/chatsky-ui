from pydantic import BaseModel
from fastapi import Query

class Pagination(BaseModel):
    page: int = Query(1, gt=0)
    limit: int = Query(10**5, gt=0)

    def offset(self) -> int:
        return (self.page - 1) * self.limit
