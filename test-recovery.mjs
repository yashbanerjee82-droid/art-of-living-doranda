import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { chromium } from 'playwright';

// Load environment variables
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

const TEST_EMAIL = `audit_recovery_${Date.now()}@test.com`;

async function runTest() {
  console.log(`[1] Creating test user: ${TEST_EMAIL}`);
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL,
    password: 'InitialPassword123!',
    email_confirm: true,
  });

  if (createError) {
    console.error("Failed to create test user:", createError);
    return;
  }

  const userId = userData.user.id;
  
  // Assign Volunteer profile
  await adminClient.from('profiles').insert({
    id: userId,
    email: TEST_EMAIL,
    name: 'Audit Recovery',
    responsibilities: ['Volunteer']
  });

  console.log(`[2] Generating recovery link...`);
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: TEST_EMAIL,
    options: {
      redirectTo: 'http://localhost:3000/staff/update-password'
    }
  });

  if (linkError) {
    console.error("Failed to generate link:", linkError);
    return;
  }

  const recoveryUrl = linkData.properties.action_link;
  console.log(`[3] Generated Recovery URL:\n${recoveryUrl}`);

  console.log(`[4] Launching Playwright browser...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all network redirects
  const urlsVisited = [];
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      urlsVisited.push(frame.url());
      console.log(`[NAVIGATE] ${frame.url()}`);
    }
  });

  // Capture browser console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  try {
    console.log(`[5] Navigating to recovery URL...`);
    await page.goto(recoveryUrl, { waitUntil: 'networkidle' });
    
    // Check if we arrived at the correct page
    console.log(`[6] Current URL: ${page.url()}`);
    if (page.url().includes('error=')) {
      console.error(`[FAIL] Reached error page: ${page.url()}`);
    }

    console.log(`[7] Filling out new password...`);
    await page.waitForSelector('input[name="password"]');
    await page.fill('input[name="password"]', 'NewSecurePassword123!');
    
    console.log(`[8] Submitting form...`);
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('**/staff/dashboard**', { timeout: 5000 });
      console.log(`[9] Successfully redirected to dashboard! Final URL: ${page.url()}`);
    } catch (e) {
      await page.screenshot({ path: 'test-failure.png' });
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.error(`[FAIL] Redirect failed. Current URL: ${page.url()}`);
      console.error(`[FAIL] Page Text:\n${bodyText}`);
      throw e;
    }
    
    // Clean up
    console.log(`[10] Cleaning up test user...`);
    await adminClient.auth.admin.deleteUser(userId);
    
    console.log("\n--- TEST COMPLETED SUCCESSFULLY ---");
    console.log("URLs Visited:", urlsVisited);
    
  } catch (err) {
    console.error("\n[TEST FAILED] Exception during browser automation:");
    console.error(err);
  } finally {
    await browser.close();
  }
}

runTest();
