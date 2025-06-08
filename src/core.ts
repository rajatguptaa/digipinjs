const DIGIPIN_GRID = [
    ['F','C','9','8'],
    ['J','3','2','7'],
    ['K','4','5','6'],
    ['L','M','P','T']
  ];
  const BOUNDS = { minLat: 2.5, maxLat: 38.5, minLon: 63.5, maxLon: 99.5 };
  
  /**
   * Encode latitude & longitude into DIGIPIN
   */
  export function getDigiPin(lat: number, lon: number): string {
    if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat)
      throw new Error('Latitude out of range');
    if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon)
      throw new Error('Longitude out of range');
  
    let [minLat, maxLat, minLon, maxLon] = [BOUNDS.minLat, BOUNDS.maxLat, BOUNDS.minLon, BOUNDS.maxLon];
    let code = '';
    for (let level = 1; level <= 10; level++) {
      const latStep = (maxLat - minLat) / 4;
      const lonStep = (maxLon - minLon) / 4;
      let row = 3 - Math.floor((lat - minLat) / latStep);
      let col = Math.floor((lon - minLon) / lonStep);
      row = Math.min(3, Math.max(0, row));
      col = Math.min(3, Math.max(0, col));
      code += DIGIPIN_GRID[row][col];
      if (level === 3 || level === 6) code += '-';
      maxLat = minLat + latStep * (4 - row);
      minLat = minLat + latStep * (3 - row);
      minLon = minLon + lonStep * col;
      maxLon = minLon + lonStep;
    }
    return code;
  }
  
  /**
   * Decode DIGIPIN back to lat/lon center
   */
  export function getLatLngFromDigiPin(pin: string): { latitude: number; longitude: number } {
    const clean = pin.replace(/-/g, '');
    if (clean.length !== 10) throw new Error('Invalid DIGIPIN');
    let [minLat, maxLat, minLon, maxLon] = [BOUNDS.minLat, BOUNDS.maxLat, BOUNDS.minLon, BOUNDS.maxLon];
    for (const char of clean) {
      let found = false;
      let ri = 0, ci = 0;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (DIGIPIN_GRID[r][c] === char) { ri = r; ci = c; found = true; break; }
        }
        if (found) break;
      }
      if (!found) throw new Error('Invalid character');
      const latStep = (maxLat - minLat) / 4;
      const lonStep = (maxLon - minLon) / 4;
      const newMaxLat = minLat + latStep * (4 - ri);
      const newMinLat = minLat + latStep * (3 - ri);
      const newMinLon = minLon + lonStep * ci;
      const newMaxLon = newMinLon + lonStep;
      [minLat, maxLat, minLon, maxLon] = [newMinLat, newMaxLat, newMinLon, newMaxLon];
    }
    return { latitude: (minLat + maxLat) / 2, longitude: (minLon + maxLon) / 2 };
  }