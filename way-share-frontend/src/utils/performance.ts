// Performance monitoring utilities for Way-Share

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
}

export interface WebVitals {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const performanceMetrics: Partial<PerformanceMetrics> = {};
let clsValue = 0;
let isLoggingEnabled = false;

export const measurePerformance = (enableLogging = false) => {
  if (typeof window === 'undefined') return;
  
  isLoggingEnabled = enableLogging;
  
  // Core Web Vitals measurement
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        performanceMetrics.fcp = navEntry.loadEventEnd - navEntry.fetchStart;
        performanceMetrics.lcp = navEntry.loadEventEnd - navEntry.fetchStart;
        performanceMetrics.ttfb = navEntry.responseStart - navEntry.fetchStart;
        performanceMetrics.tti = navEntry.domInteractive - navEntry.fetchStart;
        
        if (isLoggingEnabled) {
          console.log('Navigation Performance:', {
            fcp: performanceMetrics.fcp,
            lcp: performanceMetrics.lcp,
            ttfb: performanceMetrics.ttfb,
            tti: performanceMetrics.tti,
          });
        }
      }
      
      if (entry.entryType === 'largest-contentful-paint') {
        performanceMetrics.lcp = entry.startTime;
        if (isLoggingEnabled) {
          console.log('LCP:', entry.startTime);
        }
      }
      
      if (entry.entryType === 'first-input') {
        const fidEntry = entry as PerformanceEventTiming;
        performanceMetrics.fid = fidEntry.processingStart - fidEntry.startTime;
        if (isLoggingEnabled) {
          console.log('FID:', performanceMetrics.fid);
        }
      }
    }
  });
  
  // Observe different performance entry types
  try {
    observer.observe({ type: 'navigation', buffered: true });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('Performance API not supported:', e);
    // Fallback for older browsers
    console.warn('Performance Observer not fully supported');
  }
  
  // Layout shift measurement
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
        clsValue += (entry as unknown as { value: number }).value;
      }
    }
    performanceMetrics.cls = clsValue;
    if (isLoggingEnabled) {
      console.log('CLS:', clsValue);
    }
  });
  
  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('Performance API not supported:', e);
    console.warn('Layout Shift Observer not supported');
  }
  
  return () => {
    observer.disconnect();
    clsObserver.disconnect();
  };
};

export const getPerformanceMetrics = (): Partial<PerformanceMetrics> => {
  return { ...performanceMetrics };
};

export const evaluateWebVitals = (metrics: Partial<PerformanceMetrics>): WebVitals[] => {
  const vitals: WebVitals[] = [];
  
  // LCP thresholds: good (≤2.5s), needs improvement (≤4s), poor (>4s)
  if (metrics.lcp !== undefined) {
    vitals.push({
      name: 'LCP',
      value: metrics.lcp,
      rating: metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor',
      delta: metrics.lcp,
      id: 'lcp',
    });
  }
  
  // FID thresholds: good (≤100ms), needs improvement (≤300ms), poor (>300ms)
  if (metrics.fid !== undefined) {
    vitals.push({
      name: 'FID',
      value: metrics.fid,
      rating: metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor',
      delta: metrics.fid,
      id: 'fid',
    });
  }
  
  // CLS thresholds: good (≤0.1), needs improvement (≤0.25), poor (>0.25)
  if (metrics.cls !== undefined) {
    vitals.push({
      name: 'CLS',
      value: metrics.cls,
      rating: metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor',
      delta: metrics.cls,
      id: 'cls',
    });
  }
  
  // TTFB thresholds: good (≤800ms), needs improvement (≤1800ms), poor (>1800ms)
  if (metrics.ttfb !== undefined) {
    vitals.push({
      name: 'TTFB',
      value: metrics.ttfb,
      rating: metrics.ttfb <= 800 ? 'good' : metrics.ttfb <= 1800 ? 'needs-improvement' : 'poor',
      delta: metrics.ttfb,
      id: 'ttfb',
    });
  }
  
  return vitals;
};

export const reportPerformanceMetrics = (metrics: Partial<PerformanceMetrics>) => {
  // In a real application, this would send data to an analytics service
  // For now, we'll just log the metrics
  const vitals = evaluateWebVitals(metrics);
  
  console.group('Performance Report');
  console.log('Raw Metrics:', metrics);
  console.log('Web Vitals:', vitals);
  
  const poorVitals = vitals.filter(v => v.rating === 'poor');
  const needsImprovementVitals = vitals.filter(v => v.rating === 'needs-improvement');
  
  if (poorVitals.length > 0) {
    console.warn('Poor performing vitals:', poorVitals);
  }
  
  if (needsImprovementVitals.length > 0) {
    console.warn('Vitals needing improvement:', needsImprovementVitals);
  }
  
  console.groupEnd();
  
  // Return summary for automated testing
  return {
    overall: poorVitals.length === 0 ? 'good' : 'needs-improvement',
    poor: poorVitals.length,
    needsImprovement: needsImprovementVitals.length,
    good: vitals.filter(v => v.rating === 'good').length,
    vitals,
  };
};

export const measurePageLoad = () => {
  return new Promise<Partial<PerformanceMetrics>>((resolve) => {
    if (document.readyState === 'complete') {
      setTimeout(() => resolve(getPerformanceMetrics()), 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => resolve(getPerformanceMetrics()), 100);
      });
    }
  });
};

export const measureRenderTime = <T>(
  component: string,
  fn: () => T
): { result: T; duration: number } => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (isLoggingEnabled) {
    console.log(`${component} render time: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
};

export const measureAsyncOperation = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (isLoggingEnabled) {
    console.log(`${operation} completed in: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return null;
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.endsWith('.js'));
  const cssResources = resources.filter(r => r.name.endsWith('.css'));
  
  const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  
  return {
    totalJS: totalJSSize,
    totalCSS: totalCSSSize,
    total: totalJSSize + totalCSSSize,
    jsFiles: jsResources.length,
    cssFiles: cssResources.length,
    resources: resources.length,
  };
};

// Memory usage monitoring
export const measureMemoryUsage = () => {
  if (typeof window === 'undefined' || !(performance as unknown as { memory?: unknown }).memory) {
    return null;
  }
  
  const memory = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Start measuring immediately
  const cleanup = measurePerformance(true);
  
  // Report metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      const report = reportPerformanceMetrics(metrics);
      
      // Store in sessionStorage for debugging
      sessionStorage.setItem('performance-metrics', JSON.stringify({
        timestamp: new Date().toISOString(),
        metrics,
        report,
        bundle: analyzeBundleSize(),
        memory: measureMemoryUsage(),
      }));
    }, 2000); // Wait 2 seconds for all metrics to be collected
  });
  
  return cleanup;
};