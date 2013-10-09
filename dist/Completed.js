(function() {
    if (typeof window.Completed === "undefined") {
        var Completed = {};
        var module = {};

        Completed.module = {
            add: function(moduleName, moduleContent) {
                if (!module[moduleName]) {
                    module[moduleName] = moduleContent; 
                }
            },
            get: function(moduleName) {
                return module[moduleName];
            }
        };

        window.Completed = Completed;
    }
}());
;(function() {

    var KeyMap = {
        "13" : "ENTER",
        "27" : "ESC",
        "32" : "SPACE",
        "37" : "LEFT",
        "38" : "UP",
        "39" : "RIGHT",
        "40" : "DOWN"
    };

    Completed.module.add("KeyMap", KeyMap);
}());
;(function() {

    var $ = function(sel) {
        return document.querySelectorAll(sel);
    }; 

    $.removeClass = function(sel, className) {

        var $sel;

        if (typeof sel === "string") {
            $sel = $(sel);
        }
        else {
            $sel = [sel];
        }

        for (var i = 0, len = $sel.length; i < len; i++) {
            if ($.hasClass($sel[i], className)) {

                // check all possible classnames
                var regex = new RegExp("\\s*" + className + "\\s*", "g"),
                    newClassName = $sel[i].className.replace(regex, " ");

                $sel[i].className = newClassName;
            }
        }
    };

    $.addClass = function(sel, className) {

        var $sel;

        if (typeof sel === "string") {
            $sel = $(sel);
        }
        else {
            $sel = [sel];
        }

        for (var i = 0, len = $sel.length; i < len; i++) {
            if (!$.hasClass($sel[i], className)) {
                $sel[i].className += " " + className;
            }
        }
    };

    $.hasClass = function(sel, className) {

        // hasClass is only used in single selector

        var $sel;
        
        if (typeof sel === "string") {
            $sel = $(sel)[0];
        }
        else {
            $sel = [sel][0];
        }

        if ($sel) {
            var regex = new RegExp(className);
            return regex.test($sel.className);
        }

        return false;
    };

    $.siblings = function(allSel, targetSel) {

        var doms = $(allSel),
            targetDom = $(targetSel)[0],
            nextSibling = null,
            prevSibling = null;

        for (var i = 0, len = doms.length; i < len; i++) {

            // matched 
            if (doms[i] == targetDom) {
                if (typeof doms[i-1] !== "undefined") {
                    prevSibling = doms[i-1];
                }
                if (typeof doms[i+1] !== "undefined") {
                    nextSibling = doms[i+1];
                }
            }
        }

        return {
            next : nextSibling,
            prev : prevSibling 
        };
    };

    $.trim = function(userInput) {
        return userInput.replace(/^\s\s*/, '').replace(/\s\s*$/,'');
    };

    $.on = function(eventName, sel, callback) {

        var $sel;

        if (typeof sel === "string") {
            $sel = $(sel);
        }
        else {
            $sel = [sel];
        }

        for (var i = 0, len = $sel.length; i < len; i++) {
            $sel[i].addEventListener(eventName, callback, false);
        }
    };

    Completed.module.add("$", $);
}());
;/*
 *  Scenario : 
 *
 *  Getter("data/testdata.json", function(data) {
 *      console.log(data); 
 *  })
 */

(function() {

    var Getter = function(url, callback) {
        var xhr = getXHR();

        xhr.onreadystatechange = function() {
            if (xhr.readyState < 4) {
                return;
            }

            // TODO: We can do more about logging later
            if (xhr.status !== 200) {
                throw new Error(xhr.statusText);
                return;
            }

            if (xhr.readyState === 4) {
                callback(xhr.responseText);
            }
        };

        xhr.open("GET", url, true);
        xhr.send("");
    };

    /*
     * http://goo.gl/5NkoJS
     */
    function getXHR() {

        if (window.XMLHttpRequest) {
            return new XMLHttpRequest(); 
        }

        try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
        catch (e) {}
        try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
        catch (e) {}
        try { return new ActiveXObject("Microsoft.XMLHTTP"); }
        catch (e) {}
        throw new Error("This browser does not support XMLHttpRequest.");
    }

    Completed.module.add("Getter", Getter);
}());
;(function() {

    var Console = {};

    if (window.console === "undefined") {
        ["log", "warn", "debug", "info", "error"].forEach(function(methodName) {
            Console[methodName] = function() { };
        });
    }
    else {
        Console = window.console;
    }
    
    Completed.module.add("Console", Console);
}());
;(function() {

    /*
     *  Module dependencies
     */
    var Getter = Completed.module.get("Getter");
    var KeyMap = Completed.module.get("KeyMap");
    var $ = Completed.module.get("$");
    var console = Completed.module.get("Console");

    /*
     *  Main
     */
    var newCompleted = function(inputSelectors, userOptions) {

        // options
        userOptions = userOptions || {};

        // internal values
        this.doms = $(inputSelectors);
        this.inputSelectors = inputSelectors;

        this.autoCompleteData = userOptions.data || null;
        this.autoCompleteDataSrc = userOptions.dataSrc || "public/data/autocomplete.json";
        this.autoCompleteSearchTimer = null;
        this.autoCompleteSearchDelay = userOptions.delay || 10;
        this.autoCompleteWrapperClass = "autocomplete-wrapper";
        this.autoCompleteListClass = "autocomplete-list"
        this.autoCompleteOpening = false;
        this.autoCompleteMatchedData = [];

        // constants
        this.AC_MAX_LIST_COUNT = 5;
        this.AC_LIST_OFFSET = 30;
        this.AC_WRAPPER_OFFSET = 5;

        // start point
        this.init();
    };

    newCompleted.prototype = {

        init : function() {

            // get data first
            this.getAutocompleteData(function() {
                
                this.createAutocompleteWrapper();
                this.bindAutocompleteWrapperMouseEvent();
                this.bindInputSearchEvent();

            });
        },

        createAutocompleteWrapper : function() {
            if ( $("." + this.autoCompleteWrapperClass).length === 0 ) {

                var wrapperDiv = document.createElement("div");
                wrapperDiv.className = this.autoCompleteWrapperClass + " close";

                $("body")[0].appendChild(wrapperDiv);
            }
        },

        createAutocompleteList : function() {

            var fragment = document.createDocumentFragment(),
                matches = this.autoCompleteMatchedData;

            for (var i = 0, len = matches.length; i < len; i++) {

                var match = matches[i],
                    eachListDiv = document.createElement("div");
               
                eachListDiv.innerHTML = match;
                eachListDiv.className = this.autoCompleteListClass;

                // select the first one
                if (i === 0) {
                    eachListDiv.className += " selected";
                }

                fragment.appendChild(eachListDiv);
            }

            $("." + this.autoCompleteWrapperClass)[0].appendChild(fragment);
        },

        removeAutocompleteList : function() {
            var $wrapper = $("." + this.autoCompleteWrapperClass)[0];

            while($wrapper.firstChild) {
                $wrapper.removeChild($wrapper.firstChild);
            }
        },

        showAutocompleteWrapper : function() {
            if (!this.autoCompleteOpening) {
                $.removeClass("." + this.autoCompleteWrapperClass, "close");
            }
            this.autoCompleteOpening = true;
        },

        hideAutocompleteWrapper : function() {
            if (this.autoCompleteOpening) {
                $.addClass("." + this.autoCompleteWrapperClass, "close");
            }
            this.autoCompleteOpening = false;
        },

        repositionAutocompleteWrapper : function(dom) {

            var rect = dom.getBoundingClientRect(),
                $wrapper = $("." + this.autoCompleteWrapperClass)[0];

            $wrapper.style.top = parseInt(rect.top + rect.height + this.AC_WRAPPER_OFFSET, 10) + "px";
            $wrapper.style.left = parseInt(rect.left, 10) + "px";
        },

        scrollAutocompleteWrapper : function(direction) {

            var $wrapper = $("." + this.autoCompleteWrapperClass)[0],
                $selectedListItem = $("." + this.autoCompleteListClass + ".selected")[0];

            if ($selectedListItem.offsetTop >= $wrapper.scrollTop &&
                    $selectedListItem.offsetTop <= $wrapper.scrollTop + (this.AC_MAX_LIST_COUNT - 1) * this.AC_LIST_OFFSET) {
                // we won't change the scrollTop if the cursor is located in this zone
            }
            else {
                if (direction === "UP") {
                    $wrapper.scrollTop -= this.AC_LIST_OFFSET;
                }
                else {
                    $wrapper.scrollTop += this.AC_LIST_OFFSET;
                }
            }
        },

        getAutocompleteData : function(callback) {

            var that = this;

            // we can pass autoCompleteData from userOptions directly or fetch from a link
            if ( this.autoCompleteData === null ) {
                Getter(this.autoCompleteDataSrc, function(data) {
                    // TODO
                    // check data here
                    var parsedData = JSON.parse(data);
                    that.autoCompleteData = parsedData["autoCompleteData"];

                    callback.call(that);
                });
            }
            else {
                callback.call(that);
            }
        },

        bindAutocompleteWrapperMouseEvent : function() {

            var that = this,
                $wrapper = $("." + this.autoCompleteWrapperClass)[0];

            // XXX
            // Because Event trigger order : mousedown > blur > click,
            // we have to make sure to get focus input before blur out.
            $.on("mousedown", $wrapper, function(e) {

                // Delegate
                if (that.isAutocompleteList(e.target)) {
                    that.selectMatchedData();
                    that.hideAutocompleteWrapper();
                }
            });

            $.on("mouseover", $wrapper, function(e) {
                $.removeClass("." + that.autoCompleteListClass, "selected");

                if (that.isAutocompleteList(e.target)) {
                    $.addClass(e.target, "selected");
                }
            });
        },
        
        bindInputSearchEvent : function() {

            var that = this;

            for (var i = 0, len = this.doms.length; i < len; i++) {

                var dom = this.doms[i];

                $.on("keydown", dom, function(e) {
                    if (KeyMap[e.which] === "ENTER") {
                        that.selectMatchedData();
                        that.hideAutocompleteWrapper();
                    }
                    else if (KeyMap[e.which] === "UP") {
                        that.moveAutocompleteSelector("UP"); 
                        e.preventDefault()
                    }
                    else if (KeyMap[e.which] === "DOWN") {
                        that.moveAutocompleteSelector("DOWN");
                        e.preventDefault()
                    }
                    else if (KeyMap[e.which] === "ESC") {
                        that.hideAutocompleteWrapper();
                        e.preventDefault()
                    }
                    else {

                        window.clearTimeout(that.autoCompleteSearchTimer);
                        that.autoCompleteSearchTimer = window.setTimeout(function() {

                            var userInputValue = $.trim(dom.value);
                            that.autoCompleteMatchedData = that.searchPossibleMatches(userInputValue);

                            if (that.isMatched()) {

                                // remove them first
                                that.removeAutocompleteList();
                                that.createAutocompleteList();
                                that.repositionAutocompleteWrapper(dom);
                                that.showAutocompleteWrapper();
                            }
                            else {
                                that.hideAutocompleteWrapper();
                            }

                        }, that.autoCompleteSearchDelay);
                    }
                });

                $.on("focus", dom, function(e) {
                    // because they are still left in the DOM tree 
                    if (that.isMatched()) {
                        that.repositionAutocompleteWrapper(dom);
                        that.showAutocompleteWrapper();
                    }
                });

                $.on("blur", dom, function(e) {
                    that.hideAutocompleteWrapper();
                });
            }
        },

        searchPossibleMatches : function(userInputValue) {

            if (userInputValue.length === 0) {
                return [];
            }

            var matches = [],
                regex = new RegExp("^" + userInputValue, "i");

            for (var i = 0, len = this.autoCompleteData.length; i < len; i++) {

                var currentAcData = this.autoCompleteData[i];

                if (regex.test(currentAcData)) {
                    matches.push(currentAcData);
                }
            }

            return matches;
        },

        moveAutocompleteSelector : function(direction) {

            var siblings = $.siblings("." + this.autoCompleteListClass, "." + this.autoCompleteListClass + ".selected");

            // make sure we have siblings so that we can move selector
            if (siblings.prev && direction === "UP" || siblings.next && direction === "DOWN" ) {

                $.removeClass("." + this.autoCompleteListClass, "selected");

                if (direction === "UP") {
                    $.addClass(siblings.prev, "selected");
                }
                else {
                    $.addClass(siblings.next, "selected");
                }

                // then scroll
                this.scrollAutocompleteWrapper(direction);
            }
        },

        selectMatchedData : function() {

            // make sure we can select data
            if (!this.autoCompleteOpening) {
                return;
            }

            var $focusedInput = $(this.inputSelectors + ":focus")[0],
                $selectedListItem = $("." + this.autoCompleteListClass + ".selected")[0],
                matchedData = $selectedListItem.innerHTML;

            $focusedInput.value = matchedData;
        },

        isMatched : function() {
            return (this.autoCompleteMatchedData.length > 0);
        },

        isAutocompleteList : function(dom) {
            return (dom && $.hasClass(dom, this.autoCompleteListClass));
        }

    };

    window.Completed = newCompleted;
}());
