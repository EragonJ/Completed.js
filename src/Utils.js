(function() {

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
