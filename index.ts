// for dev: tsc index.ts serviceworker.ts && python3 -m http.server 8080
/// <reference path='ostn02c.d.ts'/>

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceworker.js')
  .then(registration => console.log('Registration successful, scope is:', registration.scope))
  .catch(err => console.log('Service worker registration failed, error:', err));
}

const el = (sel: string) => document.querySelector(sel) as HTMLDivElement;

const
  elMain =el('#main'),
  elLoading = el('#loading'),
  elE = el('#e'),
  elN = el('#n'),
  elAccuracyPlusOne = el('#accuracyPlusOne'),
  elGridref = el('#gridref'),
  elTetrad = el('#tetrad'),
  elUpdated = el('#updated');

elMain.addEventListener('click', ev => {
  const elTarget = ev.target as HTMLElement;
  if (!elTarget) return;

  let text = 
    elTarget.id === 'en-copy' ? `E ${elE.innerText} N ${elN.innerText} +/- ${elAccuracyPlusOne.innerText}m` :
      elTarget.id === 'gridref-copy' ? elGridref.innerText :
        elTarget.id === 'tetrad-copy' ? elTetrad.innerText :
          null;

  if (text === null) return;
  navigator.clipboard.writeText(text);
  elTarget.classList.add('active');
  setTimeout(() => elTarget.classList.remove('active'), 800);
});

const OSTN02C = OSTN02CFactory(null, null, null, () => {
  if (!OSTN02C.OSTN02Test(false)) {
    elLoading.innerHTML = 'Tests failed.';
    return;
  };

  elLoading.innerHTML = 'Getting location &hellip;';
  navigator.geolocation.watchPosition(
    newPosition => {
      const
        { timestamp, coords: { latitude, longitude, accuracy } } = newPosition,
        latLon = { lat: latitude, lon: longitude, elevation: 0 },
        en = OSTN02C.OSGB36EastingNorthingFromETRS89EastingNorthing(OSTN02C.ETRS89EastingNorthingFromETRS89LatLon(latLon));

      if (en.geoid === 0) {
        elLoading.style.display = 'block';
        elMain.style.display = 'none';

        elLoading.innerHTML = 'Not in UK: no grid reference available';

      } else {
        elMain.style.display = 'block';
        elLoading.style.display = 'none';

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

        elE.innerHTML = e;
        elN.innerHTML = n;
        elAccuracyPlusOne.innerHTML = String(Math.round(accuracy + 1));
        elGridref.innerHTML = gridref;
        elTetrad.innerHTML = tetrad;
        elUpdated.innerHTML = displayDateTime;
      }
    },
    err => {
      elMain.style.display = 'none';
      elLoading.style.display = 'block';

      elLoading.innerHTML = `There was a problem:<br>${err.message}`;
    },
    { enableHighAccuracy: true },
  );
});

