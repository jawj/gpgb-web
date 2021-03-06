// for dev: tsc index.ts serviceworker.ts && python3 -m http.server 8080
/// <reference path='ostn02c.d.ts'/>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceworker.js')
        .then(function (registration) { return console.log('Registration successful, scope is:', registration.scope); })["catch"](function (err) { return console.log('Service worker registration failed, error:', err); });
}
var main = document.querySelector('#main'), OSTN02C = OSTN02CFactory(null, null, null, function () {
    if (!OSTN02C.OSTN02Test(false)) {
        main.innerHTML = 'Tests failed.';
        return;
    }
    ;
    main.innerHTML = 'Getting location &hellip;';
    navigator.geolocation.watchPosition(function (newPosition) {
        var timestamp = newPosition.timestamp, _a = newPosition.coords, latitude = _a.latitude, longitude = _a.longitude, accuracy = _a.accuracy, latLon = { lat: latitude, lon: longitude, elevation: 0 }, en = OSTN02C.OSGB36EastingNorthingFromETRS89EastingNorthing(OSTN02C.ETRS89EastingNorthingFromETRS89LatLon(latLon));
        if (en.geoid === 0) {
            main.innerHTML = 'Not in UK: no grid reference available';
        }
        else {
            var space_1 = '<span class="thinsp"> </span>', spaceReplace = function (s) { return s.replace(/ /g, space_1); }, spaceDigits = function (s) { return s.replace(/\d(?=(\d{3})+\b)/g, '$&' + space_1); }, e = spaceDigits(String(Math.round(en.e))), n = spaceDigits(String(Math.round(en.n))), gridref = spaceReplace(OSTN02C.gridRefFromOSGB36EastingNorthing(en, 10, true)), tetrad = OSTN02C.tetradFromOSGB36EastingNorthing(en), now = new Date().getTime(), epochCorrection = now - timestamp > 30 /* years */ * 365 /* days */ * 24 /*hours*/ * 60 /* minutes */ * 60 /* minutes */ * 1000 /* ms */ ?
                new Date(2001, 0, 1).getTime() : 0, // 30+ years off? then Safari is being *dumb*
            correctedTimestamp = timestamp + epochCorrection, date = new Date(correctedTimestamp), d2 = function (n) { return n < 10 ? "0".concat(n) : "".concat(n); }, displayDate = now - correctedTimestamp > 12 /*hours*/ * 60 /* minutes */ * 60 /* minutes */ * 1000 /* ms */ ?
                "".concat(date.getFullYear(), "-").concat(d2(date.getMonth() + 1), "-").concat(d2(date.getDate()), " ") : '', displayDateTime = "".concat(displayDate).concat(d2(date.getHours()), ":").concat(d2(date.getMinutes()), ":").concat(d2(date.getSeconds()));
            main.innerHTML =
                "<h2>Easting, northing (metres)</h2><div id=\"en\"><span id=\"e\">".concat(e, "</span><br><span id=\"n\">").concat(n, "</span>") +
                    "<span id=\"plusminus\"><br>&plusmn; ".concat(Math.round(accuracy + 1), "m</span></div>") +
                    "<h2>Grid reference (10m)</h2><div id=\"gridref\">".concat(gridref, "</div>") +
                    "<h2>Tetrad (2km)</h2><div id=\"tetrad\">".concat(tetrad, "</div>") +
                    "<h2>Updated</h2><div id=\"updated\">".concat(displayDateTime, "</div>");
        }
    }, function (err) { return main.innerHTML = "There was a problem:<br>".concat(err.message); }, { enableHighAccuracy: true });
});
