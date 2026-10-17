const wmtsEndpoint = "https://wmts.marine.copernicus.eu/teroWmts/";

export const copernicusSst = {
  product: "MEDSEA_ANALYSISFORECAST_PHY_006_013",
  dataset: "cmems_mod_med_phy-tem_anfc_4.2km_P1D-m_202511",
  variable: "thetao",
  title: "Température de l’eau · proche surface",
  unit: "°C",
  resolution: "4,2 km",
  tileMatrixSet: "EPSG:3857",
  defaultTime: "2026-10-16T00:00:00Z",
  timeCoverage: "2024-08-27 → 2026-10-25 · pas quotidien",
  depth: "-1.0182366371154785",
  depthLabel: "≈ 1 m sous la surface",
  style: "cmap:thermal",
  attribution: "Copernicus Marine Service",
  capabilitiesUrl: "https://wmts.marine.copernicus.eu/teroWmts?service=WMTS&version=1.0.0&request=GetCapabilities",
  sourceUrl: "https://data.marine.copernicus.eu/product/MEDSEA_ANALYSISFORECAST_PHY_006_013",
  get layer() {
    return `${this.product}/${this.dataset}/${this.variable}`;
  },
  tileUrl(time: string) {
    const params = new URLSearchParams({
      service: "WMTS",
      request: "GetTile",
      version: "1.0.0",
      layer: this.layer,
      tilematrixset: this.tileMatrixSet,
      tilematrix: "{z}",
      tilerow: "{y}",
      tilecol: "{x}",
      format: "image/png",
      time,
      elevation: this.depth,
      style: this.style,
    });
    // URLSearchParams encodes braces, which MapLibre needs as literal tile placeholders.
    return `${wmtsEndpoint}?${params.toString()}`
      .replaceAll("%7Bz%7D", "{z}")
      .replaceAll("%7By%7D", "{y}")
      .replaceAll("%7Bx%7D", "{x}");
  },
  get legendUrl() {
    const params = new URLSearchParams({
      SERVICE: "WMTS",
      VERSION: "1.0.0",
      REQUEST: "GetLegend",
      LAYER: this.layer,
      STYLE: this.style,
      FORMAT: "image/svg+xml",
    });
    return `${wmtsEndpoint}?${params.toString()}`;
  },
};
