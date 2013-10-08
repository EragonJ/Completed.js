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
