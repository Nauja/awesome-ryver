// ==UserScript==
// @name         AwesomeRyver
// @namespace    https://github.com/Nauja/awesome-ryver
// @version      0.1.3
// @description  Client-side plugin adding extra features to Ryver
// @author       Nauja
// @match        https://*.ryver.com/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ryver.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const VERSION = '0.1.3';

    const TEXT_RED_COLOR = '#D44945';
    const TEXT_GREEN_COLOR = '#75CF5D';
    const TEXT_BLUE_COLOR = '#7999C0';
    const SPOILER_BACKGROUND_COLOR = '#0B1A22';
    const SPOILER_VISIBLE_BACKGROUND_COLOR = '#354A54';
    const SEND_BUTTON_COLOR = '#12F493';

    function utf8_to_b64(str) {
        const codeUnits = new Uint16Array(str.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = str.charCodeAt(i);
        }
        return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
    }

    function b64_to_utf8(str) {
        const binary = atob(str);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return String.fromCharCode(...new Uint16Array(bytes.buffer));
    }

    // Commands transformations
    const RECEIVE_TRANSFORMS = [
        [/\[spoiler\](.*)\[\/spoiler\]/, (match, p1, offset, input_string) => {
            return `<div class="spoiler"><div>${b64_to_utf8(p1)}</div></div>`;
        }],
        [/\[color=([0-9a-fA-F]+)\](.*)\[\/color\]/, '<span style="color: #$1;">$2</span>'],
        [/\[red\](.*)\[\/red\]/, `<span style="color: ${TEXT_RED_COLOR};">$1</span>`],
        [/\[green\](.*)\[\/green\]/, `<span style="color: ${TEXT_GREEN_COLOR};">$1</span>`],
        [/\[blue\](.*)\[\/blue\]/, `<span style="color: ${TEXT_BLUE_COLOR};">$1</span>`],
        [/\[html\](.*)\[\/html\]/, (match, p1, offset, input_string) => {
            return unescape(p1);
        }],
        [/\[python\/\]/, (match, contents, offset, input_string) => {
            return '<pre style="font-family: monospace; white-space: pre;">             ____\n' +
                "            / . .\\\n" +
                "            \\  ---<\n" +
                "             \\  /\n" +
                "   __________/ /\n" +
                "-=:___________/</pre>";
        }],
        [/\[rainbow\](.*)\[\/rainbow\]/, '<span class="rainbow-text">$1</span>'],
        [/\[wave\](.*)\[\/wave\]/, (match, contents, offset, input_string) => {
            return `<div class="wavetext">${[...contents].map(_ => {
                return `<span>${_ !== ' ' ? _ : '&nbsp;'}</span>`;
            }).join('')}</div>`;
        }]
    ];

    const SEND_TRANSFORMS = [
        [/\[version\/\]/, VERSION],
        [/\[rand([1-9][0-9]*)?\/\]/, (match, limit, offset, input_string) => (Math.random() * (limit ? limit : 1)).toString()],
        [/\[random([1-9][0-9]*)\/\]/, (match, limit, offset, input_string) => Math.floor(Math.random() * limit).toString()],
        [/\[d([1-9][0-9]*)\/\]/, (match, limit, offset, input_string) => (Math.floor(Math.random() * parseInt(limit)) + 1).toString()],
        [/\[spoil\](.*)\[\/spoil\]/, (match, p1, offset, input_string) => `[spoiler]${utf8_to_b64(p1)}[/spoiler]`]
    ];

    // Custom CSS styles injected
    const STYLES = [
        // Rainbow style
        "@keyframes rainbow-text{0%{color:#e87d7d}2%{color:#e88a7d}4%{color:#e8977d}6%{color:#e8a47d}8%{color:#e8b07d}10%{color:#e8bd7d}12%{color:#e8ca7d}14%{color:#e8d77d}16%{color:#e8e47d}18%{color:#dfe87d}20%{color:#d3e87d}22%{color:#c6e87d}24%{color:#b9e87d}26%{color:#ace87d}28%{color:#9fe87d}30%{color:#92e87d}32%{color:#86e87d}34%{color:#7de881}36%{color:#7de88e}38%{color:#7de89b}40%{color:#7de8a8}42%{color:#7de8b5}44%{color:#7de8c1}46%{color:#7de8ce}48%{color:#7de8db}50%{color:#7de8e8}52%{color:#7ddbe8}54%{color:#7dcee8}56%{color:#7dc1e8}58%{color:#7db5e8}60%{color:#7da8e8}62%{color:#7d9be8}64%{color:#7d8ee8}66%{color:#7d81e8}68%{color:#867de8}70%{color:#927de8}72%{color:#9f7de8}74%{color:#ac7de8}76%{color:#b97de8}78%{color:#c67de8}80%{color:#d37de8}82%{color:#df7de8}84%{color:#e87de4}86%{color:#e87dd7}88%{color:#e87dca}90%{color:#e87dbd}92%{color:#e87db0}94%{color:#e87da4}96%{color:#e87d97}98%{color:#e87d8a}100%{color:#e87d7d}}.rainbow-text {animation: rainbow-text 1s infinite;}",
        // Wave style
        "@keyframes wave{from{transform:translateY(0)}to{transform:translateY(-4px)}}.wavetext span{display:inline-block;animation-duration:.3s;animation-name:wave;animation-iteration-count:infinite;animation-direction:alternate}.wavetext :nth-child(20n+0){animation-delay:-.6s}.wavetext :nth-child(20n+1){animation-delay:-.57s}.wavetext :nth-child(20n+2){animation-delay:-.54s}.wavetext :nth-child(20n+3){animation-delay:-.51s}.wavetext :nth-child(20n+4){animation-delay:-.48s}.wavetext :nth-child(20n+5){animation-delay:-.45s}.wavetext :nth-child(20n+6){animation-delay:-.42s}.wavetext :nth-child(20n+7){animation-delay:-.39s}.wavetext :nth-child(20n+8){animation-delay:-.36s}.wavetext :nth-child(20n+9){animation-delay:-.33s}.wavetext :nth-child(20n+10){animation-delay:-.3s}.wavetext :nth-child(20n+11){animation-delay:-.27s}.wavetext :nth-child(20n+12){animation-delay:-.24s}.wavetext :nth-child(20n+13){animation-delay:-.21s}.wavetext :nth-child(20n+14){animation-delay:-.18s}.wavetext :nth-child(20n+15){animation-delay:-.15s}.wavetext :nth-child(20n+16){animation-delay:-.12s}.wavetext :nth-child(20n+17){animation-delay:-90ms}.wavetext :nth-child(20n+18){animation-delay:-60ms}.wavetext :nth-child(20n+19){animation-delay:-30ms}",
        // Spoiler style
        `.spoiler{display:inline-block;border-radius:4px;padding-left: 4px;padding-right: 4px;background-color:${SPOILER_VISIBLE_BACKGROUND_COLOR}}.spoiler:not([visible]){background-color: ${SPOILER_BACKGROUND_COLOR};cursor:pointer;}.spoiler:not([visible])>div{visibility:hidden;}`
    ];

    // Unescape lib
    var regexCache = {};
    var all;

    var charSets = {
        default: {
            '&quot;': '"',
            '&#34;': '"',

            '&apos;': '\'',
            '&#39;': '\'',

            '&amp;': '&',
            '&#38;': '&',

            '&gt;': '>',
            '&#62;': '>',

            '&lt;': '<',
            '&#60;': '<'
        },
        extras: {
            '&cent;': '¢',
            '&#162;': '¢',

            '&copy;': '©',
            '&#169;': '©',

            '&euro;': '€',
            '&#8364;': '€',

            '&pound;': '£',
            '&#163;': '£',

            '&reg;': '®',
            '&#174;': '®',

            '&yen;': '¥',
            '&#165;': '¥'
        }
    };

    // don't merge char sets unless "all" is explicitly called
    Object.defineProperty(charSets, 'all', {
        get: function () {
            return all || (all = charSets.default);
        }
    });

    /**
 * Convert HTML entities to HTML characters.
 *
 * @param  {String} `str` String with HTML entities to un-escape.
 * @return {String}
 */

    function unescape(str, type) {
        if (!isString(str)) return '';
        var chars = charSets[type || 'default'];
        var regex = toRegex(type, chars);
        return str.replace(regex, function (m) {
            return chars[m];
        });
    }

    function toRegex(type, chars) {
        if (regexCache[type]) {
            return regexCache[type];
        }
        var keys = Object.keys(chars).join('|');
        var regex = new RegExp('(?=(' + keys + '))\\1', 'g');
        regexCache[type] = regex;
        return regex;
    }

    /**
 * Returns true if str is a non-empty string
 */

    function isString(str) {
        return str && typeof str === 'string';
    }

    /**
 * Expose charSets
 */

    unescape.chars = charSets.default;
    unescape.extras = charSets.extras;

    // AwesomeRyver
    const OBSERVER_INTERVAL = 5000;

    function processText(text, transforms) {
        try {
            transforms.forEach(_ => text = text.replace(_[0], _[1]));
        } catch (e) {
            console.error(e);
        }
        return text;
    }

    function processReceive(el) {
        let html = el.innerHTML;
        let newHtml = processText(html, RECEIVE_TRANSFORMS);
        if (html !== newHtml) {
            el.innerHTML = newHtml;
        }

        document.querySelectorAll("div.spoiler:not([awesome-ryver])").forEach(_ => {
            const button = _;
            button.setAttribute("awesome-ryver", "checked");
            button.onclick = () => button.setAttribute("visible", "true");
        });
    }

    function processSend(el) {
        let html = el.value;
        let newHtml = processText(html, SEND_TRANSFORMS);
        if (html !== newHtml) {
            el.value = newHtml;
        }
    }

    function observe() {
        const elements = document.body.querySelectorAll("div.chat-message__item-text:not([awesome-ryver])");
        elements.forEach(element => {
            element.setAttribute("awesome-ryver", "checked");
            const p = element.querySelector("p");
            if (p) {
                processReceive(p);
            }
        });

        const chatEditor = document.body.querySelector("div.chat-editor:not([awesome-ryver])");
        if (chatEditor) {
            chatEditor.setAttribute("awesome-ryver", "checked");
            const sendButton = chatEditor.querySelector("button.chat-editor__send");
            if (sendButton) {
                sendButton.style.backgroundColor = SEND_BUTTON_COLOR;
                const oldEvent = sendButton.onclick;
                sendButton.onclick = () => {
                    const textArea = chatEditor.querySelector("textarea.markdown-editor__input");
                    if (textArea) {
                        processSend(textArea);
                    }
                    if (oldEvent) {
                        oldEvent();
                    }
                };
            }
        }
    }

    console.log(ryver.application)
    const style = document.createElement("style");
    style.innerHTML = STYLES.join('');
    document.head.appendChild(style);

    setInterval(observe, OBSERVER_INTERVAL);
})();