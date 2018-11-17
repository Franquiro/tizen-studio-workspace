/*
 *      Copyright (c) 2016 Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.1 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://floralicense.org/license/
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

/*global pageController*/

(function() {
    var ROTATE_DATA_HAND = {
            "START": {
                "transform": "rotate(0deg)"
            },
            "END": {
                "transform": "rotate(360deg)"
            }
        },
        ROTATE_DATA_PROGRESS = {
            "START": {
                "transform": "rotate(-125deg)"
            },
            "END": {
                "transform": "rotate(125deg)"
            }
        },
        setting = {
            selectedType: "hour", // The selected type of time (hour/minute/second/none)
            timeSet: 0,
            timeRemain: 0
        },
        animTimePrevFrame,
        animRequest;

    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }

        return elm;
    }

    /**
     * Sets the text data to the element.
     * @private
     * @param {Object} elm - An element to be changed.
     * @param {string} data - A text string to set.
     */
    function setText(elm, data) {
        emptyElement(elm);
        elm.appendChild(document.createTextNode(data));
    }

    /**
     * Adds leading zero(s) to a number and make a string of fixed length.
     * @private
     * @param {number} number - A number to make a string.
     * @param {number} digit - The length of the result string.
     * @return {string} The result string
     */
    function addLeadingZero(number, digit) {
        var n = number.toString(),
            i,
            strZero = "";

        for (i = 0; i < digit - n.length; i++) {
            strZero += "0";
        }

        return strZero + n;
    }
    /**
     * Handles the hardware key event.
     * @private
     * @param {Object} event - The hardware key event object
     */
    function keyEventHandler(event) {
        if (event.keyName === "back") {
            if (pageController.isPageMain() === true) {
                // Terminate the application if the current page is the main page.
                try {
                    tizen.application.getCurrentApplication().exit();
                } catch (ignore) {}
            } else {
                // Go to the last page if the current page is not the main page.
                stopRunAnimation();
                pageController.moveBackPage();
            }
        }
    }

    /**
     * Sets the style of element with the calculated style value from dataArray, by origPos, destPos, ratio.
     * Generally used for applying animation effect.
     * @private
     * @param {Object} elm - An object to be applied the calculated style value
     * @param {Object} dataArray- An array of style data
     * @param {string} origPos- Original position of transition
     * @param {string} destPos- Destination position of transition
     * @param {number} ratio - Progress ratio of transition
     */
    function applyStyleTransition(elm, dataArray, origPos, destPos, ratio) {
        var valOrigStyle,
            valDestStyle,
            valAnimStyle;

        if (ratio > 1) {
            ratio = 1;
        }

        // Calculate the style value of the element for the moment.
        Object.keys(dataArray[origPos]).forEach(function(key) {
            switch (key) {
                case "transform":
                    // Remove the "rotate(" string, then parse float value.
                    // After parsing, calculate the result value and recover the prefix "rotate(" and suffix "deg)".
                    valOrigStyle = parseFloat(dataArray[origPos][key].substring(7));
                    valDestStyle = parseFloat(dataArray[destPos][key].substring(7));
                    valAnimStyle = "rotate(" + (valOrigStyle + (valDestStyle - valOrigStyle) * ratio) + "deg)";
                    break;
                default:
                    break;
            }

            elm.style[key] = valAnimStyle;
        });
    }

    /**
     * Makes a snapshot of main screen animation frame,
     * by setting style to elements by the current time.
     * @private
     * @param {number} timestamp - DOMHighResTimeStamp value passed by requestAnimationFrame.
     */
    function drawRunAnimationFrame(timestamp) {
        var elmDotProg = document.querySelector("#dot-progress");

        // Check timestamp of the last frame of animation.
        if (!animTimePrevFrame) {
            animTimePrevFrame = timestamp;
        }
        // TimeElapsed is sum of progress from each calls.
        setting.timeRemain -= (timestamp - animTimePrevFrame) / 1000;

        if (setting.timeRemain / setting.timeSet >= 0) {
            setText(document.querySelector("#text-run-hour"),
                    addLeadingZero(Math.floor(setting.timeRemain / 3600), 2));
            setText(document.querySelector("#text-run-minute"),
                    addLeadingZero(Math.floor(setting.timeRemain / 60) % 60, 2));
            setText(document.querySelector("#text-run-second"),
                    addLeadingZero(Math.floor(setting.timeRemain) % 60, 2));
            applyStyleTransition(elmDotProg, ROTATE_DATA_PROGRESS, "START", "END", 1 - (setting.timeRemain / setting.timeSet));

            animTimePrevFrame = timestamp;
            animRequest = window.requestAnimationFrame(drawRunAnimationFrame);
        } else {
            stopRunAnimation();
            pageController.moveBackPage();
        }
    }

    /**
     * Refreshes the data of time viewer in main page.
     * (Hour/Minute/Second text, Hour/Minute/Second rotary indicator)
     * @private
     */
    function refreshMainTimeView() {
        setText(document.querySelector("#text-main-hour"),
                addLeadingZero(Math.floor(setting.timeSet / 3600), 2));
        setText(document.querySelector("#text-main-minute"),
                addLeadingZero(Math.floor(setting.timeSet / 60) % 60, 2));
        setText(document.querySelector("#text-main-second"),
                addLeadingZero(setting.timeSet % 60, 2));
        applyStyleTransition(document.querySelector("#box-hand-hour"),
                ROTATE_DATA_HAND, "START", "END", (setting.timeSet % 43200) / 43200);
        applyStyleTransition(document.querySelector("#box-hand-minute"),
                ROTATE_DATA_HAND, "START", "END", (setting.timeSet % 3600) / 3600);
        applyStyleTransition(document.querySelector("#box-hand-second"),
                ROTATE_DATA_HAND, "START", "END", (setting.timeSet % 60) / 60);
    }

    /**
     * Stops the animation and clear the related variables.
     * @private
     */
    function stopRunAnimation() {
        window.cancelAnimationFrame(animRequest);
        animTimePrevFrame = 0;
        animRequest = 0;
    }

    /**
     * Handles the rotary event.
     * (The list will be scrolled by result)
     * @private
     * @param {Object} event - the event data object
     */
    function rotaryEventHandler(event) {
        var direction = event.detail.direction;

        if (pageController.isPageMain() === true) {
            if (direction === "CW") {
                // increase time
                setting.timeSet = modifyTime(setting.timeSet, setting.selectedType, 1);
                refreshMainTimeView();
            } else if (direction === "CCW") {
                // decrease time
                setting.timeSet = modifyTime(setting.timeSet, setting.selectedType, -1);
                refreshMainTimeView();
            }
        }
    }

    /**
     * Modifies the time by any one type(Hour/Minute/Second) of time.
     * If the result is below 0, the modification would not applied.
     * @private
     * @param {number} time - The saved time value
     * @param {string} type - The type of time to add or subtract(hour/minute/second)
     * @param {number} sign - The sign of change(+1/-1)
     * @return {number} The result of modification
     */
    function modifyTime(time, type, sign) {
        switch(type) {
            case "hour":
                if (time + 3600 * sign >= 0) {
                    time += 3600 * sign;
                }
                break;
            case "minute":
                if (time + 60 * sign >= 0) {
                    time += 60 * sign;
                }
                break;
            case "second":
                if (time + sign >= 0) {
                    time += sign;
                }
                break;
            default:
                // Do Nothing
        }

        return time;
    }

    /**
     * Stores the selected type and changes the style of text elements.
     * @private
     * @param {string} type - The selected type
     */
    function selectType(type) {
        document.querySelector("#text-main-" + setting.selectedType).className = "text-time-thin";
        switch(type) {
            case "hour":
                setting.selectedType = "hour";
                break;
            case "minute":
                setting.selectedType = "minute";
                break;
            case "second":
                setting.selectedType = "second";
                break;
            default:
                // Do Nothing
        }
        document.querySelector("#text-main-" + setting.selectedType).className = "text-time-bold";
    }

    /**
     * Sets default event listeners.
     * @private
     */
    function setDefaultEvents() {
        var btnStart = document.querySelector("#btn-start"),
            btnStop = document.querySelector("#btn-stop"),
            btnSettime = document.querySelector("#btn-settime"),
            btnReset = document.querySelector("#btn-reset"),
            objTxtHour = document.querySelector("#text-main-hour"),
            objTxtMin = document.querySelector("#text-main-minute"),
            objTxtSec = document.querySelector("#text-main-second"),
            objHandHour = document.querySelector("#hand-hour"),
            objHandMin = document.querySelector("#hand-minute"),
            objHandSec = document.querySelector("#hand-second");

        // Add hardware key event listener
        window.addEventListener("tizenhwkey", keyEventHandler);
        document.addEventListener("rotarydetent", rotaryEventHandler);

        btnStart.addEventListener("click", function() {
            pageController.movePage("page-run");
            btnStop.style.backgroundImage = "url('./image/button_stop.png')";
            setting.timeRemain = setting.timeSet;
            animRequest = window.requestAnimationFrame(drawRunAnimationFrame);
        });
        btnStop.addEventListener("click", function() {
            if (animRequest) {
                stopRunAnimation();
                btnStop.style.backgroundImage = "url('./image/button_start.png')";
            } else {
                animRequest = window.requestAnimationFrame(drawRunAnimationFrame);
                btnStop.style.backgroundImage = "url('./image/button_stop.png')";
            }
        });
        btnSettime.addEventListener("click", function() {
            stopRunAnimation();
            pageController.moveBackPage();
        });
        btnReset.addEventListener("click", function() {
            setting.timeSet = 0;
            refreshMainTimeView();
        });
        objTxtHour.addEventListener("click", function() {
            selectType("hour");
        });
        objTxtMin.addEventListener("click", function() {
            selectType("minute");
        });
        objTxtSec.addEventListener("click", function() {
            selectType("second");
        });
        objHandHour.addEventListener("click", function() {
            selectType("hour");
        });
        objHandMin.addEventListener("click", function() {
            selectType("minute");
        });
        objHandSec.addEventListener("click", function() {
            selectType("second");
        });
    }

    /**
     * Initializes the application.
     * @private
     */
    function init() {
        setDefaultEvents();

        // Add both pages to the page controller
        pageController.addPage("page-main");
        pageController.addPage("page-run");
    }

    window.onload = init;
}());