(function() {

    // Dependencies Check first
    var dependencies = [
        "Getter",
        "KeyMap"
    ];

    for (var i = 0, len = dependencies.length; i < len; i++) {
        if (typeof window[dependencies[i]] === "undefined") {
            console.error("AutoComplete depends on following libraries : " + dependencies.join(" "));
            console.error("Please Load them before using it");
            return false;
        }
    }

    // TODO
    // refactor helpers to different places 
    // and rewrite $.* functions for multiple selectors
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

    var AutoComplete = function(targetSelector, userOptions) {

        // options
        userOptions = userOptions || {};

        // internal values
        this.doms = $(targetSelector);

        this.autoCompleteData = userOptions.data || null;
        this.autoCompleteDataSrc = userOptions.dataSrc || "data/autocomplete.json";
        this.autoCompleteSearchTimer = null;
        this.autoCompleteSearchDelay = userOptions.delay || 10;
        this.autoCompleteWrapperClass = "autocomplete-wrapper";
        this.autoCompleteListClass = "autocomplete-list"
        this.autoCompleteOpening = false;
        this.autoCompleteMatchedData = [];

        // start point
        this.init();
    };

    AutoComplete.prototype = {

        init : function() {

            // get data first
            this.getAutocompleteData(function() {
                
                this.createAutocompleteWrapper();

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

            var VISUAL_OFFSET = 5,
                rect = dom.getBoundingClientRect(),
                $wrapper = $("." + this.autoCompleteWrapperClass)[0];

            $wrapper.style.top = parseInt(rect.top + rect.height + VISUAL_OFFSET, 10) + "px";
            $wrapper.style.left = parseInt(rect.left, 10) + "px";
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
        
        bindInputSearchEvent : function() {

            var that = this;

            for (var i = 0, len = this.doms.length; i < len; i++) {

                var dom = this.doms[i];

                dom.onkeydown = function(e) {

                    if (KeyMap[e.which] === "ENTER") {
                        that.selectMatchedData(dom);
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

                            var userInputValue = that.trimSpaces(dom.value);
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
                };

                dom.onfocus = function(e) {
                    // because they are still left in the DOM tree 
                    if (that.isMatched()) {
                        that.repositionAutocompleteWrapper(dom);
                        that.showAutocompleteWrapper();
                    }
                };

                dom.onblur = function(e) {
                    that.hideAutocompleteWrapper();
                };
            }
        },

        trimSpaces : function(userInputValue) {
            return userInputValue.replace(/^\s\s*/, '').replace(/\s\s*$/,'');
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
            }
        },

        selectMatchedData : function(dom) {

            var $selectedListItem = $("." + this.autoCompleteListClass + ".selected")[0],
                matchedData = $selectedListItem.innerHTML;

            dom.value = matchedData;
        },

        isMatched : function() {
            return (this.autoCompleteMatchedData.length > 0);
        }

    };

    window.AutoComplete = AutoComplete;
}());
