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

    var AutoComplete = function(targetSelector, userOptions) {

        // options
        userOptions = userOptions || {};

        // internal values
        this.doms = $(targetSelector);

        this.autoCompleteData = userOptions.data || null;
        this.autoCompleteDataSrc = userOptions.dataSrc || "data/timezone.json";

        this.autoCompleteId = "autoCompleteWrapper";


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
            if ( $("#" + this.autoCompleteId).length === 0 ) {

                var wrapperDiv = document.createElement("div");
                wrapperDiv.id = this.autoCompleteId;

                $("body")[0].appendChild(wrapperDiv);
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
                    that.autoCompleteData = parsedData["timeZoneNames"];

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

                };

                dom.onblur = function(e) {
                    
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
