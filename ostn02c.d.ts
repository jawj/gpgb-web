interface EastingNorthing {
  e: number;
  n: number;
  elevation: number;
  geoid: number;
}

interface LatLonDecimal {
  lat: number;
  lon: number;
  elevation: number;
}

interface OSMap {
  num: number;
  emin: number;
  nmin: number;
  emax: number;
  nmax: number;
}

interface DegMinSec {
  deg: number;
  min: number;
  sec: number;
  westOrSouth: boolean;
}

interface LatLonDegMinSec {
 lat: DegMinSec;
 lon: DegMinSec;
 elevation: number;
}

interface OSTN02C {
  ETRS89EastingNorthingFromETRS89LatLon(ll: LatLonDecimal): EastingNorthing;
  OSGB36EastingNorthingFromETRS89EastingNorthing(en: EastingNorthing): EastingNorthing;
  ETRS89EastingNorthingFromOSGB36EastingNorthing(en: EastingNorthing): EastingNorthing;
  ETRS89LatLonFromETRS89EastingNorthing(en: EastingNorthing): LatLonDecimal;
  degMinSecFromDecimal(n: number): DegMinSec;
  decimalFromDegMinSec(dms: DegMinSec): number;
  latLonDecimalFromLatLonDegMinSec(ll: LatLonDegMinSec): LatLonDecimal;
  latLonDegMinSecFromLatLonDecimal(ll: LatLonDecimal): LatLonDegMinSec;
  OSTN02Test(noisily: boolean): boolean;
  OSExplorerMapNextIndex(en: EastingNorthing, prevIndex: number): number; 
  gridConvergenceDegreesFromOSGB36EastingNorthing(en: EastingNorthing): number;
  gridConvergenceDegreesFromETRS89LatLon(ll: LatLonDecimal): number;
  OSExplorerMapDataForIndex(i: number): OSMap;
  OSExplorerMapNameUTF8ForIndex(i: number): string;
  OSExplorerMapSheetUTF8ForIndex(i: number): string;
  tetradFromOSGB36EastingNorthing(en: EastingNorthing): string;
  gridRefFromOSGB36EastingNorthing(en: EastingNorthing, res: 1000 | 100 | 10 | 1, spaces: boolean): string;
  geoidNameForIndex(i: number): string;
  geoidRegionForIndex(i: number): string;
}

declare function OSTN02CFactory(
  stdin: null | ((c: number) => void), 
  stdout: null | ((c: number) => void), 
  stderr: null | ((c: number) => void), 
  onRuntimeInitialized: null | (() => void),
): OSTN02C;
