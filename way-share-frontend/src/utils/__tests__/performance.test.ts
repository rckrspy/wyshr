import {
  measurePerformance,
  // getPerformanceMetrics,
  evaluateWebVitals,
  reportPerformanceMetrics,
  measureRenderTime,
  measureAsyncOperation,
  analyzeBundleSize,
  measureMemoryUsage,
} from '../performance';

// Mock performance API
// const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

// Mock performance.getEntriesByType
Object.defineProperty(performance, 'getEntriesByType', {
  value: jest.fn().mockReturnValue([
    { name: 'app.js', transferSize: 150000 },
    { name: 'vendor.js', transferSize: 200000 },
    { name: 'styles.css', transferSize: 50000 },
  ]),
});

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('measurePerformance', () => {
    it('sets up performance observers', () => {
      measurePerformance();
      expect(PerformanceObserver).toHaveBeenCalledTimes(2);
      expect(mockObserve).toHaveBeenCalled();
    });

    it('returns cleanup function', () => {
      const cleanup = measurePerformance();
      expect(typeof cleanup).toBe('function');
      
      cleanup();
      expect(mockDisconnect).toHaveBeenCalledTimes(2);
    });

    it('handles observer errors gracefully', () => {
      mockObserve.mockImplementation(() => {
        throw new Error('Observer not supported');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      measurePerformance();
      
      expect(consoleSpy).toHaveBeenCalledWith('Performance Observer not fully supported');
      consoleSpy.mockRestore();
    });
  });

  describe('evaluateWebVitals', () => {
    it('correctly evaluates LCP ratings', () => {
      const metrics = { lcp: 2000 };
      const vitals = evaluateWebVitals(metrics);
      
      expect(vitals).toHaveLength(1);
      expect(vitals[0]).toEqual({
        name: 'LCP',
        value: 2000,
        rating: 'good',
        delta: 2000,
        id: 'lcp',
      });
    });

    it('correctly evaluates FID ratings', () => {
      const metrics = { fid: 150 };
      const vitals = evaluateWebVitals(metrics);
      
      expect(vitals[0]).toEqual({
        name: 'FID',
        value: 150,
        rating: 'needs-improvement',
        delta: 150,
        id: 'fid',
      });
    });

    it('correctly evaluates CLS ratings', () => {
      const metrics = { cls: 0.3 };
      const vitals = evaluateWebVitals(metrics);
      
      expect(vitals[0]).toEqual({
        name: 'CLS',
        value: 0.3,
        rating: 'poor',
        delta: 0.3,
        id: 'cls',
      });
    });

    it('handles multiple metrics', () => {
      const metrics = {
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        ttfb: 600,
      };
      const vitals = evaluateWebVitals(metrics);
      
      expect(vitals).toHaveLength(4);
      expect(vitals.every(v => v.rating === 'good')).toBe(true);
    });
  });

  describe('reportPerformanceMetrics', () => {
    it('returns performance summary', () => {
      const metrics = {
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        ttfb: 600,
      };
      
      const report = reportPerformanceMetrics(metrics);
      
      expect(report).toEqual({
        overall: 'good',
        poor: 0,
        needsImprovement: 0,
        good: 4,
        vitals: expect.any(Array),
      });
    });

    it('identifies poor performance', () => {
      const metrics = {
        lcp: 5000,
        fid: 400,
        cls: 0.3,
      };
      
      const report = reportPerformanceMetrics(metrics);
      
      expect(report.overall).toBe('needs-improvement');
      expect(report.poor).toBe(3);
      expect(report.good).toBe(0);
    });
  });

  describe('measureRenderTime', () => {
    it('measures render time correctly', () => {
      const testFn = () => {
        // Simulate some work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
        return 'result';
      };
      
      const { result, duration } = measureRenderTime('TestComponent', testFn);
      
      expect(result).toBe('result');
      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });
  });

  describe('measureAsyncOperation', () => {
    it('measures async operation time', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      };
      
      const { result, duration } = await measureAsyncOperation('TestAsync', testFn);
      
      expect(result).toBe('async result');
      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('analyzeBundleSize', () => {
    it('analyzes bundle size correctly', () => {
      const analysis = analyzeBundleSize();
      
      expect(analysis).toEqual({
        totalJS: 350000, // 150000 + 200000
        totalCSS: 50000,
        total: 400000,
        jsFiles: 2,
        cssFiles: 1,
        resources: 3,
      });
    });

    it('returns null in non-browser environment', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing runtime behavior
      global.window = undefined;
      
      const analysis = analyzeBundleSize();
      expect(analysis).toBeNull();
      
      global.window = originalWindow;
    });
  });

  describe('measureMemoryUsage', () => {
    it('measures memory usage when available', () => {
      // Mock performance.memory
      (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory = {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000,
      };
      
      const usage = measureMemoryUsage();
      
      expect(usage).toEqual({
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000,
        usedPercentage: 10,
      });
    });

    it('returns null when memory API is not available', () => {
      const originalMemory = (performance as unknown as { memory?: unknown }).memory;
      delete (performance as unknown as { memory?: unknown }).memory;
      
      const usage = measureMemoryUsage();
      expect(usage).toBeNull();
      
      (performance as unknown as { memory?: unknown }).memory = originalMemory;
    });
  });

  describe('Performance Thresholds', () => {
    it('meets LCP threshold for good performance', () => {
      const metrics = { lcp: 2000 };
      const vitals = evaluateWebVitals(metrics);
      expect(vitals[0].rating).toBe('good');
    });

    it('meets FID threshold for good performance', () => {
      const metrics = { fid: 80 };
      const vitals = evaluateWebVitals(metrics);
      expect(vitals[0].rating).toBe('good');
    });

    it('meets CLS threshold for good performance', () => {
      const metrics = { cls: 0.08 };
      const vitals = evaluateWebVitals(metrics);
      expect(vitals[0].rating).toBe('good');
    });

    it('meets TTFB threshold for good performance', () => {
      const metrics = { ttfb: 600 };
      const vitals = evaluateWebVitals(metrics);
      expect(vitals[0].rating).toBe('good');
    });
  });
});