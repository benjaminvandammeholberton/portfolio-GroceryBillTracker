import * as fs from 'fs';
import * as cheerio from 'cheerio';

// Read the HTML file
const html = fs.readFileSync('grocery_shop.html', 'utf-8');

// Load the HTML into Cheerio
const $ = cheerio.load(html);

// Extract the order information
const orderInfo = {
  orderNumber: $('.jsx-651e3d7d95e6c51b p[data-cs-mask="true"]').text(),
  orderDate: $('.jsx-651e3d7d95e6c51b p[class^="jsx-"]').eq(1).text(),
  totalAmount: $('.jsx-651e3d7d95e6c51b .label.bold').text(),
  status: $('.jsx-6dd01ad2a8da024f.status .jJzCaG').text(),
  shippingAddress: $('.jsx-651e3d7d95e6c51b.address-list li').toArray().map((li) => $(li).text()),
  trackingLink: $('.jsx-651e3d7d95e6c51b.tracking-container a').attr('href'),
  invoiceLink: $('.jsx-651e3d7d95e6c51b.invoice-link').attr('href'),
};

console.log(orderInfo);

// Extract product details
const products = $('.jsx-db7d4c0ed254949b.product-list li').toArray().map((li) => {
  const product = {
    title: cleanText($(li).find('.jsx-327512738fd907e3.title').text()),
    vendor: $(li).find('.jsx-327512738fd907e3.vendor').text(),
    weight: $(li).find('.jsx-327512738fd907e3.weight').text(),
    subtotal: $(li).find('.jsx-327512738fd907e3.subtotal.price span').text(),
    quantity: $(li).find('.jsx-327512738fd907e3.quantity').text(),
  };
  return product;
});
function cleanText(text) {
  // Remove newline characters and replace consecutive spaces with a single space
  return text.replace(/\n/g, '').replace(/\+/g, '').replace(/\s+/g, ' ').trim();
}

console.log(products);