module.exports = {
  ci: {
    collect: {
      startServerCommand:
        "node node_modules/next/dist/bin/next start --hostname 127.0.0.1",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 120000,
      url: [
        "http://127.0.0.1:3000/",
        "http://127.0.0.1:3000/about",
        "http://127.0.0.1:3000/news",
        "http://127.0.0.1:3000/contact",
        "http://127.0.0.1:3000/admin/login",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertMatrix: [
        {
          name: "public pages",
          matchingUrlPattern: "^http://127\\.0\\.0\\.1:3000/(?!admin(?:/|$))",
          aggregationMethod: "median-run",
          assertions: {
            "categories:performance": ["error", { minScore: 0.9 }],
            "categories:accessibility": ["error", { minScore: 0.9 }],
            "categories:best-practices": ["error", { minScore: 0.9 }],
            "categories:seo": ["error", { minScore: 0.9 }],
            "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
            "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
            "total-byte-weight": ["error", { maxNumericValue: 1200000 }],
          },
        },
        {
          name: "admin sign-in",
          matchingUrlPattern: "^http://127\\.0\\.0\\.1:3000/admin/login$",
          aggregationMethod: "median-run",
          assertions: {
            "categories:performance": ["error", { minScore: 0.9 }],
            "categories:accessibility": ["error", { minScore: 0.9 }],
            "categories:best-practices": ["error", { minScore: 0.9 }],
            "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
            "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
            "total-byte-weight": ["error", { maxNumericValue: 1200000 }],
          },
        },
        {
          name: "home page script budget",
          matchingUrlPattern: "^http://127\\.0\\.0\\.1:3000/$",
          aggregationMethod: "median-run",
          assertions: {
            "resource-summary:script:transferSize": [
              "error",
              { maxNumericValue: 170000 },
            ],
          },
        },
      ],
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
