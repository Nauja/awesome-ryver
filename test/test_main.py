from awesome_ryver import run
import pytest


def test_run():
    with pytest.raises(Exception):
        run(timeout=5)
