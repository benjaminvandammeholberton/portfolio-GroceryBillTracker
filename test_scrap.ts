const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises; // Import the fs module

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set cookies
  const cookies = require('./cookies.json');
  await page.setCookie(...cookies);

  // Navigate to the desired page
  const targetPage = 'https://lafourche.fr/account/orders/535436';
  console.log(`Navigating to: ${targetPage}`);

  try {
    await page.goto(targetPage, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check if navigation was successful
    const pageTitle = await page.title();
    console.log(pageTitle)
    if (pageTitle === 'Commande #535436 - La Fourche') {
      console.log('Successfully navigated to the desired page.');
      const pageContent = await page.content();

      // Write the content to an HTML file
      await fs.writeFile('page.html', pageContent, 'utf-8');
      console.log('Page content has been saved to page.html');

      // Your data extraction logic here
      // const orderNumber = await page.$eval('.order-number', (el) => el.textContent);
      // const orderDate = await page.$eval('.order-date', (el) => el.textContent);
      // const orderTotal = await page.$eval('.order-total', (el) => el.textContent);

      // console.log('Order Number:', orderNumber);
      // console.log('Order Date:', orderDate);
      // console.log('Order Total:', orderTotal);
    } else {
      console.error('Navigation failed. The page URL does not match the expected URL.');
    }
  } catch (error:any) {
    console.error('An error occurred while navigating to the page:', error.message);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
