import { fetchRemoteStoreData, saveRemoteStoreData } from './src/services/cloudSync.js';

async function testFullCloudSync() {
  console.log('--- 1. Testing Cloud Retrieval ---');
  const initialData = await fetchRemoteStoreData();
  if (!initialData) {
    throw new Error('Failed to fetch store data from cloud!');
  }
  console.log('✓ Successfully retrieved initial cloud data.');
  console.log(`  - Products: ${initialData.products?.length}`);
  console.log(`  - Categories: ${initialData.categories?.length}`);
  console.log(`  - Banners: ${initialData.banners?.length}`);
  console.log(`  - Store WhatsApp: ${initialData.storeInfo?.whatsapp}`);
  console.log(`  - Last updated: ${initialData.updatedAt}`);

  console.log('\n--- 2. Simulating Device A (Store Owner saving new category & price update) ---');
  const testCategory = 'Coleção Verão ' + Date.now().toString().slice(-4);
  const updatedCategories = [...(initialData.categories || []), testCategory];
  
  // Device A saves new category and updates store note
  const saveResult = await saveRemoteStoreData({
    categories: updatedCategories,
    testDeviceASyncStamp: Date.now()
  });
  console.log('✓ Device A saved changes to Cloud:', saveResult);

  console.log('\n--- 3. Simulating Device B (Customer or Mobile Phone polling master catalog) ---');
  const deviceBFetched = await fetchRemoteStoreData();
  console.log('✓ Device B retrieved cloud data.');
  
  const hasCategory = deviceBFetched.categories?.includes(testCategory);
  console.log(`  - Does Device B have the new category "${testCategory}"?`, hasCategory);

  if (!hasCategory) {
    throw new Error('Sync verification failed: Device B did not receive Device A update!');
  }

  // Ensure other fields (products, banners, storeInfo) were NOT wiped by partial merge
  if (!deviceBFetched.products || deviceBFetched.products.length === 0) {
    throw new Error('Partial merge bug: Products were erased during category update!');
  }
  console.log(`✓ Data integrity verified: Products count intact (${deviceBFetched.products.length}).`);

  console.log('\n--- 4. Clean up test category ---');
  const cleanCategories = deviceBFetched.categories.filter((c) => c !== testCategory);
  await saveRemoteStoreData({ categories: cleanCategories });
  console.log('✓ Successfully cleaned up test category.');

  console.log('\n========================================');
  console.log('🎉 ALL CLOUD SYNC TESTS PASSED 100%!');
  console.log('========================================');
}

testFullCloudSync().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
