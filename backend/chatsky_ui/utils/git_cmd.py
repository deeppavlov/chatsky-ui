from pathlib import Path

from git import Repo

from chatsky_ui.core.logger_config import get_logger


def commit_changes(repo, commit_message):
    repo.git.add(A=True)
    repo.index.commit(commit_message)


def get_repo(project_dir: Path):
    repo = Repo(project_dir)
    assert not repo.bare
    return repo


def delete_tag(repo: Repo, tag_name: str):
    repo.git.tag("-d", tag_name)


def save_frontend_graph_to_git(build_id: int, chatsky_ui_repo: Repo):
    logger = get_logger(__name__)

    commit_changes(chatsky_ui_repo, f"Save script: {build_id}")
    chatsky_ui_repo.create_tag(str(build_id))
    logger.info("Flows saved to git with tag %s", build_id)

    tags = sorted(chatsky_ui_repo.tags, key=lambda t: t.commit.committed_datetime)
    if len(tags) < 2:
        logger.debug("Only one tag found")
        is_changed = True
    else:
        current_tag = tags[-1]
        previous_tag = tags[-2]
        diff = chatsky_ui_repo.git.diff(previous_tag.commit, current_tag.commit)
        logger.debug("Git diff: %s", diff)
        is_changed = bool(diff)

    logger.debug("Is changed: %s", is_changed)
    return is_changed


def save_built_script_to_git(build_id: int, bot_repo: Repo):
    logger = get_logger(__name__)

    commit_changes(bot_repo, f"create build: {build_id}")
    bot_repo.create_tag(str(build_id))
    logger.info("Bot saved to git with tag %s", build_id)
