/*
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
