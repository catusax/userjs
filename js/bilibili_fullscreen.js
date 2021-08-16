// ==UserScript==
// @name         bilibili_fullscreen
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @include	     *bilibili.com*
// @grant        none
// @require		 https://unpkg.com/hotkeys-js@3.7.3/dist/hotkeys.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    hotkeys('esc', function() {
      try{
        document.querySelector(".bilibili-player-video-web-fullscreen").click();
      }
      catch (e) {
        document.querySelector(".squirtle-video-pagefullscreen").click()
      }
        return false;//屏蔽其他event
    });

    hotkeys('pagedown', function() {
        document.querySelector(".bilibili-player-video-btn-next").click();
        return false;//屏蔽其他event
    });
})();
