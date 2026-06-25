import { chromium } from 'playwright'

async function captureEvidence() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/staff')
  
  await page.fill('input[name="email"]', 'yashbanerjee@zohomail.in')
  await page.fill('input[name="password"]', 'SecurePassword123!')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('**/staff/dashboard**')

  await page.goto('http://localhost:3000/staff/dashboard/courses')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'courses_evidence.png' })
  console.log("Captured courses_evidence.png")

  await page.goto('http://localhost:3000/staff/dashboard/events')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'events_evidence.png' })
  console.log("Captured events_evidence.png")

  await page.goto('http://localhost:3000/staff/dashboard/archive')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'archive_evidence.png' })
  console.log("Captured archive_evidence.png")

  await browser.close()
}

captureEvidence()
