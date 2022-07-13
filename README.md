# awesome-ryver
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/awesome-ryver)
[![Python package](https://img.shields.io/github/workflow/status/Nauja/awesome-ryver/Python%20package)](https://github.com/Nauja/awesome-ryver/actions/workflows/python-package.yml)
[![gitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Nauja/awesome-ryver/blob/master/LICENSE)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

This package mostly started as a joke, and from the desire of adding some extra and funny formatting features to Ryver, without requiring administrator rights or any access to the server.
This is done by either installing [AwesomeRyver.user.js](AwesomeRyver.user.js) with [Tampermonkey](https://www.tampermonkey.net/) for the web version, or by script injection with this Python package for the desktop version.

## In your browser

This is the simplest and quickest method:
* Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
* Download [AwesomeRyver.user.js](AwesomeRyver.user.js)
* Install it via Tampermonkey
* Go to ryver

## On your desktop: with prebuilt binary

With near to zero install:
* Download the lastest [AwesomeRyver-arch-version.zip](https://github.com/Nauja/awesome-ryver/releases) release for your system
* Extract the archive
* Move both the **AwesomeRyver** binary and **AwesomeRyver.user.js** script next to your **Ryver** binary
* Run **AwesomeRyver**

## On your desktop: with pip

If you have Python installed on your system, you may prefer to install this Python package with **pip**:

```bash
> pip install awesome-ryver
```

Make sure to download and move [AwesomeRyver.user.js](AwesomeRyver.user.js) in the folder from where you will be running **AwesomeRyver**, then you can launch it with:

```bash
> awesome-ryver -e C:\Path\To\Ryver.exe
```

Or:

```bash
> python -m awesome_ryver -e C:\Path\To\Ryver.exe
```

Either way, you can show the help with:

```bash
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

## Commands

Those commands work when they are detected in received messages:

| Command | Description | Preview |
|:----------|:-------------|:---------|
| [color=FF0000]colored text[/color] | Generate a colored text with an hexadecimal color | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-color.png) |
| [red]red text[/red] | Generate a colored text | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-red.png) |
| [green]green text[/green] | Generate a colored text | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-green.png) |
| [blue]blue text[/blue] | Generate a colored text | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-blue.png) |
| [rainbow]rainbow text[/rainbow] | Generate a rainbow text | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-rainbow.gif) |
| [wave]wavy text[/wave] | Generate a wavy text | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-wave.gif) |
| [html]\<b\>bold text\</b\>[/html] | Your message is replaced by the HTML code | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-html.png) |
| [python/] | Print a magnificient Python in ASCII art | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-python.png) |

Those commands only work when clicking on the green **Send** button:

| Command | Description | Preview |
|:----------|:-------------|:---------|
| [version/] | Print AwesomeRyver version | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-version.png) |
| [spoil]some secret[/spoil] | Hide the text until clicked | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-spoil.gif) |
| [rand10/] | Choose a random float between [0.0, 10.0[ | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-rand.png) |
| [random10/] | Choose a random int between [0, 10[ | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-random.png) |
| [d10/] | Choose a random int between [1, 10] | ![Preview](https://github.com/Nauja/awesome-ryver/raw/media/command-d10.png) |

More to come !

## How to build the AwesomeRyver binary

First clone this repository:

```bash
> git clone https://github.com/Nauja/awesome-ryver.git
> cd awesome-ryver
```

Install **pyinstaller**:

```bash
> python -m pip install pyinstaller
```

Run **pyinstaller**:

```bash
> pyinstaller --onefile awesome_ryver/main.py
```

This generates a **dist** folder containing a **main** binary.

Simply rename the binary to **AwesomeRyver** and put it next to **AwesomeRyver.user.js**.

## License

This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
