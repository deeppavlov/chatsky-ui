from pathlib import Path

from git import Repo


def commit_changes(repo, commit_message):
    repo.git.add(A=True)
    repo.index.commit(commit_message)


def get_repo(project_dir: Path):
    repo = Repo(project_dir)
    assert not repo.bare
    return repo


def delete_tag(repo: Repo, tag_name: str):
    repo.git.tag("-d", tag_name)
