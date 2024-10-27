// ==UserScript==
// @name        Weread gamepad control
// @namespace   Violentmonkey Scripts
// @match       https://weread.qq.com/web/reader/*
// @grant       none
// @version     1.0
// @author      -
// @license     GPL 3.0
// @description 使用xbox 游戏手柄控制微信读书翻页和滚动
// ==/UserScript==

var gamepadAPI = {
    job: 0,

    update: function () {
        // 清除按钮缓存
        gamepadAPI.buttonsCache = [];
        // 从上一帧中移动按钮状态到缓存中
        for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {
            gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
        }
        // 清除按钮状态
        gamepadAPI.buttonsStatus = [];
        // 获取 gamepad 对象
        var c = navigator.getGamepads()[0];

        // 遍历按键，并将按下的按钮加到数组中
        var pressed = [];
        if (c.buttons) {
            for (var b = 0, t = c.buttons.length; b < c.buttons.length; b++) {
                if (c.buttons[b].pressed) {
                    // console.log("buttons pressed " + gamepadAPI.buttons[b])
                    pressed.push(gamepadAPI.buttons[b]);
                }
            }
        }
        // 遍历坐标值并加到数组中
        var axes = [];
        if (c.axes) {
            for (var a = 0, x = c.axes.length; a < x; a++) {
                if (Math.abs(c.axes[a]) > 0.7) {
                    console.log("axes pressed " + gamepadAPI.axes[a])
                }
                axes.push(c.axes[a].toFixed(2));
            }
        }
        // 分配接收到的值
        gamepadAPI.axesStatus = axes;
        gamepadAPI.buttonsStatus = pressed;
        // 返回按钮以便调试
        return pressed;
    },

    buttonPressed: function (button, hold, released) {
        var newPress = false;
        var newRelease = false;

        // 轮询按下的按钮
        for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {
            // 如果我们找到我们想要的按钮
            if (gamepadAPI.buttonsStatus[i] == button) {
                // 设置布尔变量（newPress）为 true
                newPress = true;
                // 如果我们想检查按住还是单次按下
                if (!hold) {
                    // 从上一帧轮询缓存状态
                    for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {
                        // 如果按钮（之前）已经被按下了则忽略新的按下状态
                        if (gamepadAPI.buttonsCache[j] == button) {
                            newPress = false;
                        }
                    }
                }
            }
        }

        // 检查是不是放开按钮
        if (released) {
            for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {
                if (gamepadAPI.buttonsCache[j] == button) {
                    // 检查当前帧中按钮是否未被按下
                    if (!gamepadAPI.buttonsStatus.includes(button)) {
                        newRelease = true;
                    }
                }
            }
        }

        return { pressed: newPress, released: newRelease };
    },

    buttons: [
        'A', 'B', 'X', 'Y',
        'LB', 'RB', 'LT', 'RT',
        'Option', 'Start',
        'Axis-Left', 'Axis-Right',
        'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right',
    ],
    axes: [
        'Left H', 'Left V',
        'Right H', 'Right V',
    ],
    buttonsCache: [],
    buttonsStatus: [],
    axesStatus: [],
};

(function () {
    'use strict';
    window.addEventListener("gamepadconnected", (evt) => {
        console.log('控制器已连接。');

        let next = () => document.querySelector(".renderTarget_pager_button_right").click()
        let prev = () => document.querySelector(".renderTarget_pager_button:not(.renderTarget_pager_button_right)").click()

        let keyboard_down_press = () => {
            var event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: "ArrowDown", code: 40 });
            document.dispatchEvent(event);
        }

        let keyboard_down_release = () => {
            var event = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: "ArrowDown", code: 40 });
            document.dispatchEvent(event);
        }

        gamepadAPI.job = setInterval(() => {
            gamepadAPI.update()
            // 明确调用 buttonPressed 并传递按钮名称
            if (gamepadAPI.buttonPressed('A').pressed) {
                next()
            }
            // if (gamepadAPI.buttonPressed('A', true).pressed) {
            //     console.log('A 按钮被持续按下');
            // }
            // if (gamepadAPI.buttonPressed('A', false, true).released) {
            //     console.log('A 按钮被放开');
            // }

            if (gamepadAPI.buttonPressed('B').pressed) {
                prev();
            }

            if (gamepadAPI.buttonPressed('DPad-Up').pressed) {
                prev();
            }
            if (gamepadAPI.buttonPressed('DPad-Up', true).pressed) {
                const hasVerticalScrollbar = document.documentElement.scrollHeight > document.documentElement.clientHeight;
                if (hasVerticalScrollbar) {
                    window.scrollTo({
                        //60 fps
                        top: window.scrollY - (300 / 60),
                        behavior: 'instant'
                    });
                }
            }
            if (gamepadAPI.buttonPressed('DPad-Down').pressed) {
                next();
            }
            if (gamepadAPI.buttonPressed('DPad-Down', true).pressed) {
                const hasVerticalScrollbar = document.documentElement.scrollHeight > document.documentElement.clientHeight;
                if (hasVerticalScrollbar) {
                    window.scrollTo({
                        //60 fps
                        top: window.scrollY + (300 / 60),
                        behavior: 'instant'
                    });
                }
            }
            if (gamepadAPI.buttonPressed('DPad-Left').pressed) {
                prev();
            }
            if (gamepadAPI.buttonPressed('DPad-Right').pressed) {
                next();
            }
        }, 16)
    });

    window.addEventListener("gamepaddisconnected", (evt) => {
        console.log('控制器已断开。');
        clearInterval(gamepadAPI.job)
    });

})();