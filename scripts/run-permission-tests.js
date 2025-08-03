#!/usr/bin/env node

/**
 * 🧪 Permission Tests Runner for 10Q-DB
 * 
 * This script runs all permission-related tests for question uploads.
 * It includes both unit tests and integration tests.
 * 
 * Usage:
 *   node scripts/run-permission-tests.js
 * 
 * This will:
 * 1. Run unit tests (vitest)
 * 2. Run integration tests (Firestore)
 * 3. Generate a comprehensive report
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');

console.log('🧪 10Q-DB Permission Tests Runner');
console.log('=================================\n');

async function runUnitTests() {
  console.log('📋 Running Unit Tests...');
  console.log('------------------------');
  
  try {
    const command = 'npm test -- --run src/features/questions/services/__tests__/questionUploadPermissions.test.ts';
    console.log(`Executing: ${command}`);
    
    const output = execSync(command, { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(output);
    console.log('✅ Unit tests completed successfully\n');
    return { success: true, output };
    
  } catch (error) {
    console.error('❌ Unit tests failed:');
    console.error(error.stdout || error.message);
    console.log('');
    return { success: false, error: error.stdout || error.message };
  }
}

async function runIntegrationTests() {
  console.log('🔗 Running Integration Tests...');
  console.log('-------------------------------');
  
  try {
    const command = 'node scripts/test-question-upload-permissions.js';
    console.log(`Executing: ${command}`);
    
    const output = execSync(command, { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(output);
    console.log('✅ Integration tests completed successfully\n');
    return { success: true, output };
    
  } catch (error) {
    console.error('❌ Integration tests failed:');
    console.error(error.stdout || error.message);
    console.log('');
    return { success: false, error: error.stdout || error.message };
  }
}

function generateFinalReport(unitTestResult, integrationTestResult) {
  console.log('📊 Final Test Report');
  console.log('===================');
  
  const unitPassed = unitTestResult.success;
  const integrationPassed = integrationTestResult.success;
  const allPassed = unitPassed && integrationPassed;
  
  console.log(`Unit Tests: ${unitPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Integration Tests: ${integrationPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 All permission tests passed!');
    console.log('   Question upload permissions are working correctly.');
    console.log('   Only admin users can upload questions to Firestore.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.');
    
    if (!unitPassed) {
      console.log('\nUnit Test Issues:');
      console.log('-----------------');
      console.log(unitTestResult.error);
    }
    
    if (!integrationPassed) {
      console.log('\nIntegration Test Issues:');
      console.log('----------------------');
      console.log(integrationTestResult.error);
    }
  }
  
  return allPassed;
}

async function main() {
  try {
    // Run unit tests
    const unitTestResult = await runUnitTests();
    
    // Run integration tests
    const integrationTestResult = await runIntegrationTests();
    
    // Generate final report
    const allTestsPassed = generateFinalReport(unitTestResult, integrationTestResult);
    
    // Exit with appropriate code
    process.exit(allTestsPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
}); 