import puppeteer from 'puppeteer';

async function runE2ETest() {
  console.log('🚀 Starting E2E Test on http://localhost:3000 ...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ----------------------------------------------------
    // STEP 1: Admin logs in
    // ----------------------------------------------------
    console.log('--- TEST 1: Admin Login at /admin ---');
    const adminPage = await browser.newPage();
    await adminPage.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });

    // Verify Password input is present
    const passwordInput = await adminPage.$('input[type="password"]');
    if (!passwordInput) {
      throw new Error('Password input not found on /admin!');
    }
    console.log('✓ Admin login screen is loaded on /admin');

    // Type wrong password first
    await passwordInput.type('wrongpass');
    await adminPage.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 500));
    const errorText = await adminPage.$eval('form', (el) => el.innerText);
    if (!errorText.includes('Senha incorreta')) {
      throw new Error('Expected "Senha incorreta" on wrong password!');
    }
    console.log('✓ Invalid password correctly rejected');

    // Type correct password
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.press('Backspace');
    await passwordInput.type('admin123@');
    await adminPage.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1500));

    const pageContent = await adminPage.$eval('body', (el) => el.innerText);
    console.log('Page content after submit:\n', pageContent.slice(0, 300));

    // Verify we are inside Admin Dashboard
    const adminHeader = await adminPage.$eval('header', (el) => el.innerText).catch(() => '');
    console.log('Header text:', adminHeader);
    if (!adminHeader.toLowerCase().includes('painel administrativo')) {
      throw new Error(`Failed to login to Admin Dashboard! Page text: ${pageContent.slice(0, 200)}`);
    }
    console.log('✓ Admin successfully logged in to Admin Dashboard');

    // ----------------------------------------------------
    // STEP 2: Admin pauses the store
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Pause Store in Admin ---');
    // Find the pause toggle button
    const buttons = await adminPage.$$('button');
    let pauseBtn = null;
    for (const b of buttons) {
      const txt = (await b.evaluate((el) => el.innerText)).toUpperCase();
      if (txt.includes('PAUSADA') || txt.includes('NO AR')) {
        pauseBtn = b;
        break;
      }
    }

    if (!pauseBtn) {
      throw new Error('Pause button not found in admin header!');
    }

    const currentStatusText = (await pauseBtn.evaluate((el) => el.innerText)).toUpperCase();
    console.log(`Current store status button text: "${currentStatusText.trim()}"`);

    // If currently "NO AR", click it to Pause
    if (currentStatusText.includes('NO AR')) {
      console.log('Clicking to PAUSE store...');
      await pauseBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
    }

    const updatedStatusText = (await pauseBtn.evaluate((el) => el.innerText)).toUpperCase();
    console.log(`Updated store status button text: "${updatedStatusText.trim()}"`);
    if (!updatedStatusText.includes('PAUSADA')) {
      throw new Error('Expected store status button to say "PAUSADA"!');
    }
    console.log('✓ Store is marked as "Pausada" in Admin');

    // ----------------------------------------------------
    // STEP 3: Brand new visitor in fresh incognito context
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Visitor Experience while Store is Paused ---');
    const visitorContext = await browser.createBrowserContext();
    const visitorPage = await visitorContext.newPage();
    await visitorPage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));

    const visitorBodyText = (await visitorPage.$eval('body', (el) => el.innerText)).toUpperCase();
    const hasPausedBanner = visitorBodyText.includes('LOJA TEMPORARIAMENTE PAUSADA');
    const hasNovidades = visitorBodyText.includes('ESTAMOS PREPARANDO NOVIDADES') || visitorBodyText.includes('ESTAMOS ATUALIZANDO');
    const hasProducts = visitorBodyText.includes('COLEÇÃO OFICIAL') || visitorBodyText.includes('DESTAQUES & LANÇAMENTOS');

    console.log(`Visitor page contains "LOJA TEMPORARIAMENTE PAUSADA": ${hasPausedBanner}`);
    console.log(`Visitor page contains "ESTAMOS ATUALIZANDO": ${hasNovidades}`);
    console.log(`Visitor page contains products: ${hasProducts}`);

    if (!hasPausedBanner) {
      console.error('\n❌ FAILURE: Visitor does not see "LOJA TEMPORARIAMENTE PAUSADA"!');
      console.log('Visitor page snippet:\n', visitorBodyText.slice(0, 500));
      throw new Error('Visitor was NOT blocked by maintenance screen!');
    }

    if (hasProducts) {
      throw new Error('Visitor CAN SEE products while store is paused!');
    }
    console.log('✓ SUCCESS: Visitor sees maintenance screen and products are hidden!');

    // ----------------------------------------------------
    // STEP 3.5: Admin clicks "Ver Loja" while paused
    // ----------------------------------------------------
    console.log('\n--- TEST 3.5: Admin Clicks "Ver Loja" while Store is Paused ---');
    const verLojaBtn = await adminPage.$('button[title="Visualizar loja virtual"]');
    if (verLojaBtn) {
      await verLojaBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
      const adminStoreText = (await adminPage.$eval('body', (el) => el.innerText)).toUpperCase();
      console.log(`Admin sees "LOJA PAUSADA AO PÚBLICO": ${adminStoreText.includes('LOJA PAUSADA AO PÚBLICO')}`);
      console.log(`Admin sees "REATIVAR LOJA": ${adminStoreText.includes('REATIVAR LOJA')}`);
      console.log(`Admin sees "PRÉ-VISUALIZAR CATÁLOGO": ${adminStoreText.includes('PRÉ-VISUALIZAR CATÁLOGO')}`);

      if (!adminStoreText.includes('LOJA PAUSADA AO PÚBLICO')) {
        throw new Error('Admin did not see maintenance screen with admin control banner!');
      }

      // Test Admin Preview
      const previewBtn = await adminPage.$('button[title="Ver os produtos e catálogo sem despausar para os clientes"]');
      if (previewBtn) {
        console.log('Testing Admin Catalog Preview...');
        await previewBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
        const previewText = (await adminPage.$eval('body', (el) => el.innerText)).toUpperCase();
        console.log(`Admin in preview sees products: ${previewText.includes('COLEÇÃO OFICIAL')}`);
        console.log(`Admin in preview has return button: ${previewText.includes('VOLTAR À TELA DE PAUSA')}`);
      }

      // Go back to /admin
      await adminPage.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 1000));
    }

    // ----------------------------------------------------
    // STEP 4: Admin unpauses the store
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Re-activate Store ---');
    const buttonsAfter = await adminPage.$$('button');
    let reActivateBtn = null;
    for (const b of buttonsAfter) {
      const txt = (await b.evaluate((el) => el.innerText)).toUpperCase();
      if (txt.includes('PAUSADA')) {
        reActivateBtn = b;
        break;
      }
    }
    if (!reActivateBtn) {
      throw new Error('Could not find Pausada button to re-activate!');
    }

    console.log('Clicking to RE-ACTIVATE store...');
    await reActivateBtn.click();
    await new Promise((r) => setTimeout(r, 1500));

    const reActivatedText = (await reActivateBtn.evaluate((el) => el.innerText)).toUpperCase();
    console.log(`Status after unpausing: "${reActivatedText.trim()}"`);
    if (!reActivatedText.includes('NO AR')) {
      throw new Error('Expected store status button to say "NO AR" after unpausing!');
    }

    // ----------------------------------------------------
    // STEP 5: Visitor checks store after unpause
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Visitor Experience after Store is Re-activated ---');
    await visitorPage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));

    const visitorAfterText = (await visitorPage.$eval('body', (el) => el.innerText)).toUpperCase();
    console.log(`Visitor sees "COLEÇÃO OFICIAL": ${visitorAfterText.includes('COLEÇÃO OFICIAL')}`);
    console.log(`Visitor sees products: ${visitorAfterText.includes('DESTAQUES & LANÇAMENTOS')}`);

    if (visitorAfterText.includes('LOJA TEMPORARIAMENTE PAUSADA')) {
      throw new Error('Visitor still sees paused screen after unpause!');
    }
    console.log('✓ SUCCESS: Store is public again and visitor sees products!');

    console.log('\n========================================');
    console.log('🎉 ALL E2E TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('========================================');
  } finally {
    await browser.close();
  }
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
