import * as fs from 'fs';
import * as cheerio from 'cheerio';
export default function exctractFromHTMLToJson() {
  const rawData = getFromHTML('grocery_shop.html');
  const formatedData = formatData(rawData);
  saveToJson(formatedData);

  function cleanText(text: string) {
    // Remove newline characters and replace consecutive spaces with a single space
    return text
      .replace(/\n/g, '')
      .replace(/\+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function getFromHTML(filePath: string) {
    // Read the HTML file
    const html = fs.readFileSync(filePath, 'utf-8');

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Extract the order information
    const orderInfo = {
      orderNumber: $('.jsx-651e3d7d95e6c51b p[data-cs-mask="true"]').text(),
      orderDate: $('.jsx-651e3d7d95e6c51b p[class^="jsx-"]').eq(1).text(),
      totalAmount: $('.jsx-651e3d7d95e6c51b .label.bold').text(),
      status: $('.jsx-6dd01ad2a8da024f.status .jJzCaG').text(),
      shippingAddress: $('.jsx-651e3d7d95e6c51b.address-list li')
        .toArray()
        .map((li) => $(li).text()),
      trackingLink: $('.jsx-651e3d7d95e6c51b.tracking-container a').attr(
        'href'
      ),
      invoiceLink: $('.jsx-651e3d7d95e6c51b.invoice-link').attr('href'),
    };

    // Extract product details
    const products = $('.jsx-db7d4c0ed254949b.product-list li')
      .toArray()
      .map((li) => {
        const product = {
          title: cleanText($(li).find('.jsx-327512738fd907e3.title').text()),
          vendor: $(li).find('.jsx-327512738fd907e3.vendor').text(),
          weight: $(li).find('.jsx-327512738fd907e3.weight').text(),
          subtotal: $(li)
            .find('.jsx-327512738fd907e3.subtotal.price span')
            .text(),
          quantity: $(li).find('.jsx-327512738fd907e3.quantity').text(),
        };
        return product;
      });

    const rawData = [orderInfo, products];
    return rawData;
  }
  function formatData(rawData: Array<any>): any {
    if (rawData.length !== 2 || !Array.isArray(rawData[1])) {
      // Check if the rawData has the expected structure
      console.error('Invalid rawData structure');
      return rawData;
    }

    // Map over the products array and update the "quantity," "weight," and "subtotal" properties
    const updatedProducts = rawData[1].map((product) => {
      // Extract the numeric part from the "quantity" string
      const matchQuantity = product.quantity.match(/\d+/);
      const newQuantity = matchQuantity ? parseInt(matchQuantity[0], 10) : 0; // Parse the matched digits as an integer

      // Extract the numeric part and unit from the "weight" string
      const matchWeight = product.weight.match(/(\d+)\s*(\D*)/);
      const newWeight = matchWeight ? parseInt(matchWeight[1], 10) : 0; // Parse the numeric part as an integer
      const unit = matchWeight ? matchWeight[2].trim() : ''; // Extract and trim the unit part

      // Remove the Euro symbol from the "subtotal" string and convert it to a floating-point number
      const subtotalString = product.subtotal.replace(/[^\d.,]/g, ''); // Remove all characters except digits, dot, and comma
      const subtotal = parseFloat(subtotalString.replace(',', '.')); // Replace comma with dot and parse as a float

      // Create a copy of the product object with the updated properties
      return {
        ...product,
        quantity: newQuantity,
        weight: newWeight,
        unit: unit,
        subtotal: subtotal,
      };
    });

    // Update the rawData array with the updated products
    rawData[1] = updatedProducts;

    console.log(rawData);

    return rawData;
  }
  function saveToJson(formatedData: Array<any>) {
    // Convert the JSON data to a string
    const jsonString = JSON.stringify(formatedData, null, 2); // 2-space indentation for pretty formatting

    // Specify the file path where you want to write the JSON data
    const filePath = 'data.json';

    try {
      // Write the JSON data to the file
      fs.writeFileSync(filePath, jsonString, 'utf-8');
      console.log('JSON data has been written to the file:', filePath);
    } catch (error) {
      console.error('Error writing JSON data to the file:', error);
    }
  }
}
