__all__ = ["main", "run"]
import argparse
import requests
import time
import websocket
import json
import socket
import subprocess
import os
import sys
from pathlib import Path
from typing import Union, Optional
import logging


"""Script injected into Ryver for injecting the plugin"""
_INJECTOR_JS = """
(function() {{
    console.log("running injector...");
    const fs = require("fs");
    const process = require('process');
    const path = require('path');
    
    let script = "{plugin_path}";
    if (!fs.existsSync(script)) {{
        console.error("{plugin_path} not found");
        return;
    }}

    const data = fs.readFileSync(script).toString();
    console.log("file");
    const webview = document.querySelector("webview");
    let codeInjected = false;

    function injectScript() {{
        if (codeInjected === true) return;
        console.log("inject script");
        webview.executeJavaScript(data);
        codeInjected = true;
    }}
    
    webview.addEventListener('did-start-loading', () => {{
        console.log("webview did-start-loading");
        codeInjected = false;
    }});

    webview.addEventListener('dom-ready', () => {{
        console.log("webview dom-ready");
        injectScript();
    }});

    injectScript();
}})();
"""


# This is a modified version of https://github.com/tintinweb/electron-inject
logger = logging.getLogger(__name__)


_SCRIPT_HOTKEYS_F12_DEVTOOLS_F5_REFRESH = """document.addEventListener("keydown", function (e) {
    if (e.which === 123) {
        //F12
        require("electron").remote.BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
    } else if (e.which === 116) {
        //F5
        location.reload();
    }
});"""


class _LazyWebsocket(object):
    def __init__(self, url):
        self.url = url
        self.ws = None

    def _connect(self):
        if not self.ws:
            self.ws = websocket.create_connection(self.url)
        return self.ws

    def send(self, *args, **kwargs):
        return self._connect().send(*args, **kwargs)

    def recv(self, *args, **kwargs):
        return self.ws.recv(*args, **kwargs)

    def sendrcv(self, msg):
        self.send(msg)
        return self.recv()

    def close(self):
        self.ws.close()


class _ElectronRemoteDebugger(object):
    def __init__(self, host, port):
        self.params = {"host": host, "port": port}

    def windows(self):
        params = self.params.copy()
        params.update({"ts": int(time.time())})

        ret = []
        for w in self.requests_get(
            "http://%(host)s:%(port)s/json/list?t=%(ts)d" % params
        ).json():
            url = w.get("webSocketDebuggerUrl")
            if not url:
                continue
            w["ws"] = _LazyWebsocket(url)
            ret.append(w)
        return ret

    def requests_get(self, url, tries=5, delay=1):
        last_exception = Exception("failed to request after %d tries." % tries)
        for _ in range(tries):
            try:
                return requests.get(url)
            except requests.exceptions.ConnectionError as ce:
                # ignore it
                last_exception = ce
            time.sleep(delay)
        raise last_exception

    def sendrcv(self, w, msg):
        return w["ws"].sendrcv(msg)

    def eval(self, w, expression):

        data = {
            "id": 1,
            "method": "Runtime.evaluate",
            "params": {
                "contextId": 1,
                "doNotPauseOnExceptionsAndMuteConsole": False,
                "expression": expression,
                "generatePreview": False,
                "includeCommandLineAPI": True,
                "objectGroup": "console",
                "returnByValue": False,
                "userGesture": True,
            },
        }

        ret = json.loads(w["ws"].sendrcv(json.dumps(data)))
        if "result" not in ret:
            return ret
        if ret["result"].get("wasThrown"):
            raise Exception(ret["result"]["result"])
        return ret["result"]

    @classmethod
    def execute(cls, path, port=None, timeout=None):
        if port is None:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(("", 0))
            port = sock.getsockname()[1]
            sock.close()

        cmd = "%s %s" % (path, "--remote-debugging-port=%d" % port)
        print(cmd)
        p = subprocess.Popen(cmd, shell=True)
        try:
            p.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            raise TimeoutError(
                "Could not execute cmd (not found or already running?): %r" % cmd
            )

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        for _ in range(30):
            result = sock.connect_ex(("localhost", port))
            if result > 0:
                break
            time.sleep(1)
        return cls("localhost", port=port)


def _launch_url(url):
    # https://stackoverflow.com/questions/4216985/call-to-operating-system-to-open-url
    if sys.platform == "win32":
        os.startfile(url)
    elif sys.platform == "darwin":
        subprocess.Popen(["open", url])
    else:
        try:
            subprocess.Popen(["xdg-open", url])
        except OSError:
            logger.info("Please open a browser on: " + url)


def _inject(
    target, devtools=False, browser=False, timeout=None, scripts=None, port=None
):
    erb = _ElectronRemoteDebugger.execute(target, port, timeout=timeout)

    timeout = time.time() + int(timeout) if timeout else 5

    windows_visited = set()
    while True:
        for w in (_ for _ in erb.windows() if _.get("id") not in windows_visited):
            try:
                if devtools:
                    logger.info("injecting hotkeys script into %s" % w.get("id"))
                    logger.debug(erb.eval(w, _SCRIPT_HOTKEYS_F12_DEVTOOLS_F5_REFRESH))

                for name, content in scripts.items():
                    logger.info("injecting %s into %s" % (name, w.get("id")))
                    logger.debug(erb.eval(w, content))

            except Exception as e:
                logger.exception(e)
            finally:
                # patch windows only once
                windows_visited.add(w.get("id"))

        if time.time() > timeout or all(
            w.get("id") in windows_visited for w in erb.windows()
        ):
            break
        logger.debug("timeout not hit.")
        time.sleep(1)

        # launch browser?
    if browser:
        _launch_url("http://%(host)s:%(port)s/" % erb.params)


# This is my own code
def run(
    *,
    exe: str = None,
    devtools: Optional[bool] = None,
    plugin: Optional[Union[str, Path]] = None,
    timeout: Optional[int] = None
) -> None:
    """Run Ryver with injected plugin.

    :param exe: path to Ryver executable
    :param devtools: enable devtools access from Ryver
    :param plugin: path to the plugin script
    :param timeout: timeout when trying to launch Ryver
    """
    exe = exe if exe is not None else "Ryver.exe"
    plugin = plugin if plugin is not None else Path.cwd() / "AwesomeRyver.user.js"
    if isinstance(plugin, str):
        plugin = Path(plugin)

    _inject(
        target=exe,
        devtools=devtools,
        scripts={
            "Injector.js": _INJECTOR_JS.format(plugin_path=plugin.absolute().as_posix())
        },
        timeout=timeout,
    )


def main(argv: list[str] = None) -> None:
    parser = argparse.ArgumentParser(prog="awesome-ryver", description="Help")
    parser.add_argument(
        "-t",
        "--timeout",
        type=int,
        default=None,
        help="Timeout when trying to launch Ryver",
    )
    parser.add_argument(
        "-e", "--exe", type=str, default="Ryver.exe", help="Path to Ryver executable"
    )
    parser.add_argument(
        "-d",
        "--devtools",
        action="store_true",
        help="Enable devtools access from Ryver",
    )
    parser.add_argument("-p", "--plugin", type=str, help="Path to the plugin script")
    args = parser.parse_args(args=argv)

    run(exe=args.exe, devtools=args.devtools, plugin=args.plugin, timeout=args.timeout)


if __name__ == "__main__":
    main()
