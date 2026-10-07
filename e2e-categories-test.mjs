import puppeteer from 'puppeteer';

async function runCategoriesE2ETest() {
  console.log('🚀 Starting Categories E2E Test on http://localhost:3000 ...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850 });

    // Clear previous localStorage to ensure clean state
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    // ----------------------------------------------------
    // TEST 1: Check Default Categories on Storefront
    // ----------------------------------------------------
    console.log('--- TEST 1: Default categories on Storefront ---');
    const headerCategories = await page.$$eval('header nav button', (btns) =>
      btns.map((b) => b.innerText.trim())
    );
    console.log('Storefront Header Nav Categories:', headerCategories);
    const hasVestidos = headerCategories.some((c) => c.toUpperCase().includes('VESTIDOS'));
    const hasConjuntos = headerCategories.some((c) => c.toUpperCase().includes('CONJUNTOS'));
    if (!hasVestidos || !hasConjuntos) {
      throw new Error(`Expected default categories in Header nav, got: ${JSON.stringify(headerCategories)}`);
    }
    console.log('✓ Storefront Header Nav displays initial categories correctly');

    // ----------------------------------------------------
    // TEST 2: Navigate to /admin and Login
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Access /admin and Login ---');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });

    const passwordInput = await page.$('input[type="password"]');
    if (!passwordInput) {
      throw new Error('Password input not found on /admin login modal!');
    }
    await passwordInput.type('admin123@');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1200));

    // Verify Admin Dashboard is open
    const pageBody = await page.$eval('body', (el) => el.innerText);
    if (!pageBody.toUpperCase().includes('PAINEL ADMINISTRATIVO')) {
      throw new Error('Admin Dashboard not displayed after login!');
    }
    console.log('✓ Successfully logged in to Admin Dashboard');

    // ----------------------------------------------------
    // TEST 3: Navigate to "Categorias" Tab
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Open Categorias tab ---');
    const clickedTab = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const catBtn = btns.find((b) => b.innerText.toUpperCase().includes('CATEGORIAS'));
      if (catBtn) {
        catBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedTab) {
      throw new Error('Categorias tab button not found in Admin Dashboard!');
    }
    await new Promise((r) => setTimeout(r, 600));

    // Verify AdminCategoriesManager is active
    const managerText = await page.$eval('main', (el) => el.innerText);
    if (!managerText.toUpperCase().includes('TOTAL DE CATEGORIAS') || !managerText.toUpperCase().includes('NOVA CATEGORIA')) {
      throw new Error('AdminCategoriesManager did not render properly!');
    }
    console.log('✓ Categorias Tab opened with metrics and actions');

    // ----------------------------------------------------
    // TEST 4: Add a New Category ("Alfaiataria")
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Add New Category ---');
    // Click "Nova Categoria" button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find((b) => b.innerText.toUpperCase().includes('NOVA CATEGORIA'));
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Type category name
    const catInput = await page.$('input[placeholder*="Alfaiataria"]');
    if (!catInput) {
      throw new Error('New category input not found in modal!');
    }
    await catInput.type('Alfaiataria');

    // Submit modal form
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createBtn = btns.find((b) => b.innerText.toUpperCase().includes('CRIAR CATEGORIA'));
      if (createBtn) createBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify "Alfaiataria" appears in list
    const currentCats = await page.$$eval('main span', (spans) =>
      spans.map((s) => s.innerText.trim())
    );
    if (!currentCats.some((c) => c.toLowerCase() === 'alfaiataria')) {
      throw new Error('Newly created category "Alfaiataria" not found in list!');
    }
    console.log('✓ Category "Alfaiataria" created and listed successfully');

    // ----------------------------------------------------
    // TEST 5: Edit/Rename Category ("Alfaiataria" -> "Alfaiataria Luxo")
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Edit/Rename Category ---');
    const editClicked = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const targetSpan = spans.find((s) => s.innerText.trim() === 'Alfaiataria');
      if (!targetSpan) return false;
      const row = targetSpan.closest('div.p-4');
      if (!row) return false;
      const editBtn = Array.from(row.querySelectorAll('button')).find((b) => b.innerText.includes('Editar'));
      if (editBtn) {
        editBtn.click();
        return true;
      }
      return false;
    });

    if (!editClicked) {
      throw new Error('Edit button for Alfaiataria not found!');
    }
    await new Promise((r) => setTimeout(r, 600));

    // Type new name in edit modal
    const editInput = await page.$('input[placeholder*="Nome atualizado"]');
    if (!editInput) {
      throw new Error('Edit input not found in edit category modal!');
    }
    await editInput.click({ clickCount: 3 });
    await editInput.type('Alfaiataria Luxo');

    // Submit edit
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find((b) => b.innerText.toUpperCase().includes('SALVAR ALTERAÇÕES'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify "Alfaiataria Luxo" appears in list
    const updatedCats = await page.$$eval('main span', (spans) =>
      spans.map((s) => s.innerText.trim())
    );
    if (!updatedCats.some((c) => c.toLowerCase() === 'alfaiataria luxo')) {
      throw new Error('Renamed category "Alfaiataria Luxo" not found in list!');
    }
    console.log('✓ Category successfully renamed to "Alfaiataria Luxo"');

    // ----------------------------------------------------
    // TEST 6: Verify New Category in Products Modal & Filters
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Verify in Products Tab ---');
    // Switch to "Produtos" tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const prodBtn = btns.find((b) => b.innerText.toUpperCase().includes('PRODUTOS'));
      if (prodBtn) prodBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Check category filter dropdown in product list
    const filterOptions = await page.$$eval('select', (selects) => {
      const catSelect = selects.find((s) => Array.from(s.options).some((o) => o.value === 'Vestidos'));
      return catSelect ? Array.from(catSelect.options).map((o) => o.value) : [];
    });
    console.log('Product List Filter categories found:', filterOptions);
    if (!filterOptions.includes('Alfaiataria Luxo')) {
      throw new Error('Category "Alfaiataria Luxo" not found in Product List filter options!');
    }
    console.log('✓ "Alfaiataria Luxo" is present in Product List category filter');

    // Open "Novo Produto" modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const newBtn = btns.find((b) => b.innerText.toUpperCase().includes('NOVO PRODUTO'));
      if (newBtn) newBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // Check category select in Product Modal
    const modalCategoryOptions = await page.$$eval('select', (selects) => {
      for (const sel of selects) {
        const opts = Array.from(sel.options).map((o) => o.value);
        if (opts.includes('Vestidos')) return opts;
      }
      return [];
    });
    console.log('Product Modal category select options:', modalCategoryOptions);
    if (!modalCategoryOptions.includes('Alfaiataria Luxo')) {
      throw new Error('Category "Alfaiataria Luxo" not found in Product Modal category select!');
    }
    console.log('✓ "Alfaiataria Luxo" is available when creating a new product');

    // Close product modal
    const closeBtn = await page.$('button[class*="rounded-full bg-brand-card"]');
    if (closeBtn) await closeBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // ----------------------------------------------------
    // TEST 7: Delete Category with Fallback Migration
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Delete Category with Fallback ---');
    // Go back to "Categorias" tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const catBtn = btns.find((b) => b.innerText.toUpperCase().includes('CATEGORIAS'));
      if (catBtn) catBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Find delete button for "Alfaiataria Luxo"
    const deleteClicked = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const targetSpan = spans.find((s) => s.innerText.trim() === 'Alfaiataria Luxo');
      if (!targetSpan) return false;
      const row = targetSpan.closest('div.p-4');
      if (!row) return false;
      const delBtn = row.querySelector('button[title*="Remover"]');
      if (delBtn) {
        delBtn.click();
        return true;
      }
      return false;
    });

    if (!deleteClicked) {
      throw new Error('Delete button for Alfaiataria Luxo not found!');
    }
    await new Promise((r) => setTimeout(r, 600));

    // Confirm deletion in modal
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confirmBtn = btns.find((b) => b.innerText.toUpperCase().includes('CONFIRMAR EXCLUSÃO'));
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify "Alfaiataria Luxo" is gone
    const finalCats = await page.$$eval('main span', (spans) =>
      spans.map((s) => s.innerText.trim())
    );
    if (finalCats.some((c) => c.toLowerCase() === 'alfaiataria luxo')) {
      throw new Error('Category "Alfaiataria Luxo" was not removed from list!');
    }
    console.log('✓ Category "Alfaiataria Luxo" successfully deleted and removed from list');

    // ----------------------------------------------------
    // TEST 8: Verify Storefront Sync
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Storefront Sync & Navigation ---');
    // Click "Ver Loja" button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const storeBtn = btns.find((b) => b.innerText.toUpperCase().includes('VER LOJA'));
      if (storeBtn) storeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify pills and header on storefront
    const storefrontHeaderCats = await page.$$eval('header nav button', (btns) =>
      btns.map((b) => b.innerText.trim())
    );
    console.log('Final Storefront Header Nav Categories:', storefrontHeaderCats);
    if (!storefrontHeaderCats.some((c) => c.toUpperCase().includes('VESTIDOS')) || storefrontHeaderCats.includes('Alfaiataria Luxo')) {
      throw new Error('Storefront Header Nav did not reflect latest categories state!');
    }
    console.log('✓ Storefront Header Nav accurately reflects updated categories state');

    console.log('\n🎉 ALL CATEGORY MANAGEMENT E2E TESTS PASSED 100% SUCCESSFULLY! 🎉');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runCategoriesE2ETest();
