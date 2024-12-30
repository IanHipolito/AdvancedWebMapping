import * as webVitals from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    webVitals.onCLS(onPerfEntry);
    webVitals.onFID(onPerfEntry);
    webVitals.onFCP(onPerfEntry);
    webVitals.onLCP(onPerfEntry);
    webVitals.onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
