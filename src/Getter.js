/*
 *  Scenario : 
 *
 *  Getter("data/testdata.json", function(data) {
 *      console.log(data); 
 *  })
 */

(function() {

    // TODO
    // check arguments later
    var Getter = function(url, callback) {
        var xhr;

        if (typeof XMLHttpRequest !== "undefined") {
            xhr = new XMLHttpRequest(); 
        }
        else {
            // No IE here
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState < 4) {
                return;
            }

            if (xhr.status !== 200) {
                return;
            }

            if (xhr.readyState === 4) {
                callback(xhr.responseText);
            }
        };

        xhr.open("GET", url, true);
        xhr.send("");
    };

    Completed.module.add("Getter", Getter);
}());
