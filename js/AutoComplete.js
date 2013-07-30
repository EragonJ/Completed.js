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

    // helpers
    var $ = function(sel) {
        return document.querySelectorAll(sel);
    }; 

    $.removeClass = function(sel, className) {
        var $sel = $(sel)[0];

        if ($.hasClass(sel, className)) {

            // check all possible classnames
            var regex = new RegExp("\\s*" + className + "\\s*", "g"),
                newClassName = $sel.className.replace(regex, " ");

            $sel.className = newClassName;
        }
    };

    $.addClass = function(sel, className) {
        var $sel = $(sel)[0];

        if (!$.hasClass(sel, className)) {
            $sel.className += " " + className;
        }
    };

    $.hasClass = function(sel, className) {
        var $sel = $(sel)[0];

        if ($sel) {
            var regex = new RegExp(className);
            return regex.test($sel.className);
        }

        return false;
    };

    var AutoComplete = function(targetSelector, userOptions) {

        // options
        userOptions = userOptions || {};

        // internal values
        this.doms = $(targetSelector);

        this.autoCompleteData = userOptions.data || null;
        this.autoCompleteDataSrc = userOptions.dataSrc || "data/autocomplete.json";
        this.autoCompleteWrapperClass = "autocomplete-wrapper";
        this.autoCompleteListClass = "autocomplete-list"
        this.autoCompleteOpening = false;

        // start point
        this.init();
    };

    AutoComplete.prototype = {

        init : function() {

            // get data first
            this.getAutocompleteData(function() {
                
                this.createAutocompleteWrapper();

                this.bindEvents();

            });
        },

        createAutocompleteWrapper : function() {
            if ( $("." + this.autoCompleteWrapperClass).length === 0 ) {

                var wrapperDiv = document.createElement("div");
                wrapperDiv.className = this.autoCompleteWrapperClass + " close";

                $("body")[0].appendChild(wrapperDiv);
            }
        },

        createAutocompleteList : function(matches) {

            var fragment = document.createDocumentFragment();

            for (var i = 0, len = matches.length; i < len; i++) {

                var match = matches[i],
                    eachListDiv = document.createElement("div");
               
                eachListDiv.innerHTML = match;
                eachListDiv.className = this.autoCompleteListClass;

                fragment.appendChild(eachListDiv);
            }

            $("." + this.autoCompleteWrapperClass)[0].appendChild(fragment);
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
        
        bindEvents : function() {
            var that = this;

            for (var i = 0, len = this.doms.length; i < len; i++) {

                var dom = this.doms[i];

                dom.onkeyup = function(e) {
                    
                    var userInputValue = that.trimSpaces(this.value),
                        matches = that.searchPossibleMatches(userInputValue);

                    // clean first
                    if (matches.length > 0) {
                        that.createAutocompleteList(matches);
                        that.showAutocompleteWrapper();
                    }
                    else {
                        that.hideAutocompleteWrapper();
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

    };

    window.AutoComplete = AutoComplete;
}());
