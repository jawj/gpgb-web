// for dev: tsc index.ts serviceworker.ts && python3 -m http.server 8080
/// <reference path='ostn02c.d.ts'/>

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceworker.js')
  .then(registration => console.log('Registration successful, scope is:', registration.scope))
  .catch(err => console.log('Service worker registration failed, error:', err));
}

const
  main = document.querySelector('#main')!,
  OSTN02C = OSTN02CFactory(null, null, null, () => {
    if (!OSTN02C.OSTN02Test(false)) {
      main.innerHTML = 'Tests failed.';
      return;
    };

    main.innerHTML = 'Getting location &hellip;';
    navigator.geolocation.watchPosition(
      newPosition => {
        const
          { timestamp, coords: { latitude, longitude, accuracy } } = newPosition,
          latLon = { lat: latitude, lon: longitude, elevation: 0 },
          en = OSTN02C.OSGB36EastingNorthingFromETRS89EastingNorthing(OSTN02C.ETRS89EastingNorthingFromETRS89LatLon(latLon));

        if (en.geoid === 0) {
          main.innerHTML = 'Not in UK: no grid reference available';

        } else {
          const
            space = '<span class="thinsp"> </span>',
            spaceReplace = (s: string) => s.replace(/ /g, space),
            spaceDigits = (s: string) => s.replace(/\d(?=(\d{3})+\b)/g, '$&' + space),
            e = spaceDigits(String(Math.round(en.e))),
            n = spaceDigits(String(Math.round(en.n))),
            gridref = spaceReplace(OSTN02C.gridRefFromOSGB36EastingNorthing(en, 10, true)),
            tetrad = OSTN02C.tetradFromOSGB36EastingNorthing(en),
            now = new Date().getTime(),
            epochCorrection =
              now - timestamp > 30 /* years */ * 365 /* days */ * 24 /*hours*/ * 60 /* minutes */ * 60 /* minutes */ * 1000 /* ms */ ?
                new Date(2001, 0, 1).getTime() : 0,  // 30+ years off? then Safari is being *dumb*
            correctedTimestamp = timestamp + epochCorrection,
            date = new Date(correctedTimestamp),
            d2 = (n: number) => n < 10 ? `0${n}` : `${n}`,
            displayDate =
              now - correctedTimestamp > 12 /*hours*/ * 60 /* minutes */ * 60 /* minutes */ * 1000 /* ms */ ?
                `${date.getFullYear()}-${d2(date.getMonth() + 1)}-${d2(date.getDate())} ` : '',
            displayDateTime = `${displayDate}${d2(date.getHours())}:${d2(date.getMinutes())}:${d2(date.getSeconds())}`;

          main.innerHTML =
            `<h2>Easting, northing (metres)</h2><div id="en"><span id="e">${e}</span><br><span id="n">${n}</span>` +
            `<span id="plusminus"><br>&plusmn; ${Math.round(accuracy + 1)}m</span></div>` +
            `<h2>Grid reference (10m)</h2><div id="gridref">${gridref}</div>` +
            `<h2>Tetrad (2km)</h2><div id="tetrad">${tetrad}</div>` +
            `<h2>Updated</h2><div id="updated">${displayDateTime}</div>`;
        }
      },
      err => main.innerHTML = `There was a problem:<br>${err.message}`,
      { enableHighAccuracy: true },
    );
  });

