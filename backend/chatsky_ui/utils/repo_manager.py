from pathlib import Path
from typing import Union

from git import Repo

from chatsky_ui.core.logger_config import get_logger


class RepoManager:
    def __init__(self, project_dir: Path):
        self.project_dir = project_dir
        print("project_dir: ", project_dir)
        self.repo = self.get_repo()
        self._logger = None

    @property
    def logger(self):
        if self._logger is None:
            raise ValueError("Logger has not been configured. Call set_logger() first.")
        return self._logger

    def set_logger(self):
        self._logger = get_logger(__name__)

    @classmethod
    def init_new_repo(cls, git_path: Path, tag_name: str):
        repo = Repo.init(git_path)
        repo.git.checkout(b="dev")
        repo.git.add(A=True)
        repo.index.commit("Init frontend flows")
        repo.create_tag(tag_name)

        print("Repo initialized with tag %s", tag_name)

    def get_repo(self):
        repo = Repo(self.project_dir)
        assert not repo.bare
        return repo

    def commit_changes(self, commit_message):
        self.repo.git.add(A=True)
        self.repo.index.commit(commit_message)

    def commit_with_tag(self, build_id: int):
        self.commit_changes(f"Save script: {build_id}")
        self.repo.create_tag(str(build_id))
        self.logger.info("Repo '%s' is saved to git with tag %s", self.project_dir, build_id)

    def delete_tag(self, tag_name: str):
        self.repo.git.tag("-d", tag_name)

    def checkout_tag(self, tag_name: Union[int, str], file_name: str):
        self.repo.git.checkout(tag_name, file_name)

    def is_changed(self):
        tags = sorted(self.repo.tags, key=lambda t: t.commit.committed_datetime)
        if not tags:
            return True
        latest_tag = tags[-1]
        diff = self.repo.git.diff(latest_tag.commit)
        return bool(diff)

    def is_repeated_tag(self, tag: int) -> bool:
        for repo_tag in self.repo.tags:
            if repo_tag.name == str(tag):
                return True
        return False
