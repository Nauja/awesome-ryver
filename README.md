# awesome-ryver
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/awesome-ryver)
[![Python package](https://img.shields.io/github/workflow/status/Nauja/awesome-ryver/Python%20package)](https://github.com/Nauja/awesome-ryver/actions/workflows/python-package.yml)
[![gitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Nauja/awesome-ryver/blob/master/LICENSE)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

This package mostly started as a joke, and from the desire of adding some extra and funny formatting features to Ryver, without requiring administrator rights or any access to the server.
This is done by either installing [AwesomeRyver.user.js](AwesomeRyver.user.js) with [Tampermonkey](https://www.tampermonkey.net/) for the web version, or by script injection with this Python package for the desktop version.

## In your browser

Easy, first make sure [Tampermonkey](https://www.tampermonkey.net/) is installed in your browser, then download [AwesomeRyver.user.js](AwesomeRyver.user.js) and install it via Tampermonkey.

## On your desktop

The simplest method with near to zero install is to download the [lastest release](https://github.com/Nauja/awesome-ryver/releases) for your system, extract the archive, and run the **AwesomeRyver** binary. This is a packaged version of this Python package which avoid the need of installing Python, plus the dependencies, on your computer.

Please note that **AwesomeRyver.user.js** is bundled in the archive and must be located near the **AwesomeRyver** binary for it to work. Alternatively, you can pass the path to **AwesomeRyver.user.js** with:

```bash
> AwesomeRyver.exe -p C:\Path\To\AwesomeRyver.user.js
```

If **Ryver.exe** is not in your **PATH**, you may have to launch the binary with:

```bash
> AwesomeRyver.exe -e C:\Path\To\Ryver.exe
```

If you already have Python installed on your system, you may prefer to install this Python package with:

```bash
> pip install awesome-ryver
```

And then you can launch it with:

```bash
> awesome-ryver -e C:\Path\To\Ryver.exe
```

Or:

```bash
> python -m awesome_ryver -e C:\Path\To\Ryver.exe
```

Either way, you can show the help with:

```bash
> AwesomeRyver.exe -h
> awesome-ryver -h
> python -m awesome_ryver -h

usage: awesome-ryver [-h] [-t TIMEOUT] [-e EXE] [-d] [-p PLUGIN]

Help

optional arguments:
  -h, --help            show this help message and exit
  -t TIMEOUT, --timeout TIMEOUT
                        Timeout when trying to launch Ryver
  -e EXE, --exe EXE     Path to Ryver executable
  -d, --devtools        Enable devtools access from Ryver
  -p PLUGIN, --plugin PLUGIN
                        Path to the plugin script
```

## License

This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
