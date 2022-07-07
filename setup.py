from setuptools import find_packages, setup


def read(*filenames, **kwargs):
    """ Read contents of multiple files and join them together """
    sep = kwargs.get("sep", "\n")
    buf = []
    for filename in filenames:
        with open(filename) as f:
            buf.append(f.read())
    return sep.join(buf)


pkg_info = {}
exec(read("awesome_ryver/__version__.py"), pkg_info)


setup(
    name="awesome-ryver",
    version=pkg_info["__version__"],
    author=pkg_info["__author__"],
    description="Client-side plugin adding extra features to Ryver",
    install_requires=["requests", "websocket", "argparse"],
    packages=find_packages(exclude=["test"]),
    entry_points={"console_scripts": ["awesome-ryver=awesome_ryver.main:main"]},
    include_package_data=False,
    zip_safe=True,
)
