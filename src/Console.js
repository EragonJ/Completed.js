(function() {

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
