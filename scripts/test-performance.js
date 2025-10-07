#!/usr/bin/env node

/**
 * Performance Testing Script for Martyr Archive Landing Page
 * Run with: node scripts/test-performance.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Performance test configuration
const TEST_CONFIG = {
  landingPage: '/api/martyrs/landing',
  searchPage: '/api/martyrs/search?q=test',
  fullMartyrs: '/api/martyrs',
  iterations: 5,
  timeout: 10000
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            responseTime,
            dataSize: Buffer.byteLength(data, 'utf8'),
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            responseTime,
            dataSize: Buffer.byteLength(data, 'utf8'),
            data: data,
            headers: res.headers,
            parseError: true
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(TEST_CONFIG.timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Performance test function
async function runPerformanceTest() {
  console.log('🚀 Starting Performance Tests for Martyr Archive Landing Page\n');
  
  const results = {
    landingPage: [],
    searchPage: [],
    fullMartyrs: []
  };
  
  // Test landing page API (5 martyrs)
  console.log('📊 Testing Landing Page API (5 martyrs)...');
  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    try {
      const result = await makeRequest(`${BASE_URL}${TEST_CONFIG.landingPage}`);
      results.landingPage.push(result);
      console.log(`  Test ${i + 1}: ${result.responseTime}ms, ${result.dataSize} bytes`);
    } catch (error) {
      console.log(`  Test ${i + 1}: Error - ${error.message}`);
    }
  }
  
  // Test search API
  console.log('\n🔍 Testing Search API...');
  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    try {
      const result = await makeRequest(`${BASE_URL}${TEST_CONFIG.searchPage}`);
      results.searchPage.push(result);
      console.log(`  Test ${i + 1}: ${result.responseTime}ms, ${result.dataSize} bytes`);
    } catch (error) {
      console.log(`  Test ${i + 1}: Error - ${error.message}`);
    }
  }
  
  // Test full martyrs API (all martyrs)
  console.log('\n📚 Testing Full Martyrs API (all martyrs)...');
  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    try {
      const result = await makeRequest(`${BASE_URL}${TEST_CONFIG.fullMartyrs}`);
      results.fullMartyrs.push(result);
      console.log(`  Test ${i + 1}: ${result.responseTime}ms, ${result.dataSize} bytes`);
    } catch (error) {
      console.log(`  Test ${i + 1}: Error - ${error.message}`);
    }
  }
  
  // Calculate and display results
  console.log('\n📈 Performance Test Results\n');
  
  const calculateStats = (data) => {
    const validResults = data.filter(r => r.responseTime);
    if (validResults.length === 0) return null;
    
    const times = validResults.map(r => r.responseTime);
    const sizes = validResults.map(r => r.dataSize);
    
    return {
      count: validResults.length,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
      minSize: Math.min(...sizes),
      maxSize: Math.max(...sizes)
    };
  };
  
  const landingStats = calculateStats(results.landingPage);
  const searchStats = calculateStats(results.searchPage);
  const fullStats = calculateStats(results.fullMartyrs);
  
  if (landingStats) {
    console.log('🏠 Landing Page API (5 martyrs):');
    console.log(`  Response Time: ${landingStats.avgTime}ms avg (${landingStats.minTime}ms - ${landingStats.maxTime}ms)`);
    console.log(`  Data Size: ${landingStats.avgSize} bytes avg (${landingStats.minSize} - ${landingStats.maxSize} bytes)`);
  }
  
  if (searchStats) {
    console.log('\n🔍 Search API:');
    console.log(`  Response Time: ${searchStats.avgTime}ms avg (${searchStats.minTime}ms - ${searchStats.maxTime}ms)`);
    console.log(`  Data Size: ${searchStats.avgSize} bytes avg (${searchStats.minSize} - ${searchStats.maxSize} bytes)`);
  }
  
  if (fullStats) {
    console.log('\n📚 Full Martyrs API:');
    console.log(`  Response Time: ${fullStats.avgTime}ms avg (${fullStats.minTime}ms - ${fullStats.maxTime}ms)`);
    console.log(`  Data Size: ${fullStats.avgSize} bytes avg (${fullStats.minSize} - ${fullStats.maxSize} bytes)`);
  }
  
  // Performance comparison
  if (landingStats && fullStats) {
    const timeImprovement = ((fullStats.avgTime - landingStats.avgTime) / fullStats.avgTime * 100).toFixed(1);
    const sizeImprovement = ((fullStats.avgSize - landingStats.avgSize) / fullStats.avgSize * 100).toFixed(1);
    
    console.log('\n🎯 Performance Improvements:');
    console.log(`  Response Time: ${timeImprovement}% faster`);
    console.log(`  Data Size: ${sizeImprovement}% smaller`);
  }
  
  // Cache headers check
  console.log('\n💾 Cache Headers Check:');
  if (results.landingPage[0]?.headers['cache-control']) {
    console.log(`  Landing API: ${results.landingPage[0].headers['cache-control']}`);
  }
  if (results.searchPage[0]?.headers['cache-control']) {
    console.log(`  Search API: ${results.searchPage[0].headers['cache-control']}`);
  }
  
  console.log('\n✅ Performance test completed!');
}

// Run the test
if (require.main === module) {
  runPerformanceTest().catch(console.error);
}

module.exports = { runPerformanceTest };
