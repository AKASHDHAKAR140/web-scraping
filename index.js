const puppeteer = require("puppeteer");
const XLSX = require('xlsx');
const fs = require("fs")
async function scrapeWebsite(url) {
    console.log(url)

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(url);

    const scrapedData = await page.evaluate(() => {

        const data = [];

        document.querySelectorAll("div[jscontroller='AtSb']").forEach((result) => {
            const companyName = result.querySelector("span[class='OSrXXb']").textContent;
            const phoneNo = result.querySelector(".rllt__details > div:nth-child(4)").textContent;
            const typeFull = result.querySelector(".rllt__details > div:nth-child(2)").textContent;
            const linkElement = result.querySelector(".VkpGBb> a");
            const url = linkElement ? linkElement.getAttribute('href') : null;
            const typeSplit = typeFull.split('·');
            const rating = typeSplit[0]?.trim() || '';
            const companyType = typeSplit[1]?.trim() || '';

            data.push({ companyName, phoneNo, rating, companyType, url });
        });
        return data;

    });
    await browser.close();
    return scrapedData;
}
function jsonToExcel(jsonData, outputPath) {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath)
    }
    XLSX.writeFile(workbook, outputPath);
}

const websiteURL = "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.2817135,77.4721435],[23.2112946,77.3654609]]";

scrapeWebsite(websiteURL)
    .then((data) => {

        const filtered = data.map(item => {
            const firstSegment = item.phoneNo.split("⋅")[1];

            const finalSegment = firstSegment?.split("·")[1];

            return {
                companyName: item.companyName,
                phoneNo: finalSegment,
                rating: item.rating,
                companyType: item.companyType,
                companyWeb: item.url,

            }
        });
        const jsonData = JSON.stringify(filtered, null, 2);
        fs.writeFileSync("data.json", jsonData);

        console.log("filtered", filtered)
        const outputPath = 'webdata.xlsx';
        jsonToExcel(filtered, outputPath);
    })
    .catch((error) => {
        console.error("Error:", error);
    });

