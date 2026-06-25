import { webkit, devices } from 'playwright'

async function runMobileAudit() {
  console.log("=== STARTING MOBILE AUDIT ===")
  const browser = await webkit.launch({ headless: true })
  const iPhone = devices['iPhone 13']
  const context = await browser.newContext({
    ...iPhone
  })
  
  const page = await context.newPage()
  
  page.on('requestfailed', request => {
    console.log(`[NETWORK FAIL] ${request.url()} - ${request.failure()?.errorText}`)
  })
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP ERROR] ${response.url()} - ${response.status()}`)
    }
  })
  
  page.on('pageerror', exception => {
    console.log(`[PAGE EXCEPTION] ${exception.message}\n${exception.stack}`)
  })
  
  page.on('requestfailed', request => {
    console.log(`[NETWORK FAIL] ${request.url()} - ${request.failure()?.errorText}`)
  })

  try {
    console.log("Navigating to homepage...")
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(1000)
    console.log("Clicking mobile menu...")
    await page.click('button.mobile-only')
    await page.waitForTimeout(2000)
    console.log("Taking screenshot of homepage...")
    await page.screenshot({ path: 'mobile_home.png', fullPage: true })

    console.log("Navigating to courses page...")
    await page.goto('http://localhost:3000/courses')
    await page.waitForTimeout(2000)

    console.log("Navigating to events page...")
    await page.goto('http://localhost:3000/events')
    await page.waitForTimeout(2000)

    console.log("Navigating to gallery page...")
    await page.goto('http://localhost:3000/gallery')
    await page.waitForTimeout(2000)
    
  } catch (error) {
    console.log(`[TEST ERROR] ${error.message}`)
  } finally {
    await browser.close()
    console.log("=== END MOBILE AUDIT ===")
  }
}

runMobileAudit()
