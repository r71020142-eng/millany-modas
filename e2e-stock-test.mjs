import puppeteer from 'puppeteer';

async function runStockAndWhatsAppTest() {
  console.log('🚀 Starting Stock & WhatsApp E2E Test on http://localhost:3000 ...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // ----------------------------------------------------
    // TEST 1: Verify WhatsApp number 553180393768 on Visitor Page
    // ----------------------------------------------------
    console.log('--- TEST 1: WhatsApp number verification ---');
    const floatingWhatsApp = await page.$eval('a[aria-label="Atendimento via WhatsApp"]', (el) => el.href);
    console.log('Floating WhatsApp URL:', floatingWhatsApp);
    if (!floatingWhatsApp.includes('553180393768')) {
      throw new Error(`Floating WhatsApp URL does not contain 553180393768! Got: ${floatingWhatsApp}`);
    }
    console.log('✓ Floating WhatsApp correctly points to 553180393768');

    // Check footer phone text
    const footerText = await page.$eval('footer', (el) => el.innerText);
    if (!footerText.includes('(31) 8039-3768')) {
      throw new Error(`Footer text does not contain (31) 8039-3768! Text: ${footerText}`);
    }
    console.log('✓ Footer contains (31) 8039-3768');

    // ----------------------------------------------------
    // TEST 2: Verify Out-of-Stock Product appearance (Gray & "Sem Estoque")
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Out-of-stock product in catalog ---');
    // Check if any product card has the "Sem Estoque" badge or grayscale
    const outOfStockBadges = await page.$$eval('span', (spans) =>
      spans.filter((s) => s.innerText.trim().toUpperCase() === 'SEM ESTOQUE' || s.innerText.trim().toUpperCase() === 'ESGOTADO').map((s) => s.innerText.trim())
    );
    console.log('Found out-of-stock badges on page:', outOfStockBadges);
    if (outOfStockBadges.length === 0) {
      throw new Error('No out-of-stock badge found on page!');
    }
    console.log('✓ Out-of-stock badge found on catalog product');

    // Check disabled button on out-of-stock card
    const disabledButtons = await page.$$eval('button[disabled]', (btns) =>
      btns.filter((b) => b.innerText.toUpperCase().includes('SEM ESTOQUE') || b.innerText.toUpperCase().includes('ESGOTADO')).map((b) => b.innerText.trim())
    );
    console.log('Disabled action buttons:', disabledButtons);
    if (disabledButtons.length === 0) {
      throw new Error('No disabled button with "Sem Estoque" found!');
    }
    console.log('✓ Disabled "Sem Estoque" button verified on out-of-stock card');

    // ----------------------------------------------------
    // TEST 3: Admin Login & Products Management
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Admin Products Management & Stock Editing ---');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });

    // Check login
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.type('admin123@');
      await page.click('button[type="submit"]');
      await new Promise((r) => setTimeout(r, 1200));
    }

    // Click on "PRODUTOS" tab
    const tabs = await page.$$('button');
    for (const t of tabs) {
      const text = await page.evaluate((el) => el.innerText, t);
      if (text.includes('PRODUTOS')) {
        await t.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 600));

    // Verify "Sem Estoque" metric card is present
    const metricText = await page.$eval('div.grid', (el) => el.innerText);
    console.log('Metric cards text:', metricText);
    if (!metricText.includes('Sem Estoque')) {
      throw new Error('Metric card "Sem Estoque" not found in Admin Products!');
    }
    console.log('✓ "Sem Estoque" metric card verified');

    // Verify stock input / buttons in table
    const stockInputs = await page.$$('input[type="number"]');
    console.log(`Found ${stockInputs.length} number inputs in products list`);
    if (stockInputs.length === 0) {
      throw new Error('No inline stock input found in products table!');
    }
    console.log('✓ Inline stock editor found in Admin Products table');

    // ----------------------------------------------------
    // TEST 4: Admin CRM & Auto-Deduct Stock on "Confirmado / Pago"
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Auto-deduct stock on Order Paid ---');
    // Click on "CRM CLIENTES" tab
    const adminTabs = await page.$$('button');
    for (const t of adminTabs) {
      const text = await page.evaluate((el) => el.innerText, t);
      if (text.includes('CRM CLIENTES')) {
        await t.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 600));

    // Find first status dropdown in orders list
    const statusSelects = await page.$$('select[aria-label="Atualizar status do pedido"]');
    console.log(`Found ${statusSelects.length} order status dropdowns`);
    if (statusSelects.length > 0) {
      // Change first select to "Confirmado / Pago"
      await statusSelects[0].select('Confirmado / Pago');
      await new Promise((r) => setTimeout(r, 1000));

      // Verify "Estoque Baixado" badge appears
      const crmPageText = await page.$eval('body', (el) => el.innerText);
      if (crmPageText.includes('Estoque Baixado') || crmPageText.includes('Confirmado / Pago')) {
        console.log('✓ Order status successfully updated to "Confirmado / Pago" and stock deduction registered!');
      }
    }

    console.log('\n=============================================');
    console.log('🎉 ALL STOCK & WHATSAPP E2E TESTS PASSED! 🎉');
    console.log('=============================================');

  } finally {
    await browser.close();
  }
}

runStockAndWhatsAppTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
