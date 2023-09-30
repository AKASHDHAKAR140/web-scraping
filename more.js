
// for email
const puppeteer = require("puppeteer");
const XLSX = require('xlsx');
const fs = require("fs")



function fetchEmailAddressesFromWebpage(url) {
    return fetch(url)
        .then(response => response.text())
        .then(html => {
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
            const matches = html.match(emailRegex) || [];
            return matches;
        })
        .catch(error => {
            console.error(`Error fetching ${url}:`, error);
            return [];
        });
}
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
        const filtered = Promise.all(data.map(async (item) => {
            const firstSegment = item.phoneNo.split("⋅")[1];
            const finalSegment = firstSegment?.split("·")[1];
            const emails = await fetchEmailAddressesFromWebpage(item.url);
            const uniqueEmails = [...new Set(emails)];
            const web_email = uniqueEmails.join(', ');
            return {
                companyName: item.companyName,
                phoneNo: finalSegment,
                rating: item.rating,
                companyType: item.companyType,
                companyWeb: item.url,
                email: web_email.toString()
            };
        }));
        const jsonData = JSON.stringify(filtered, null, 2);
        fs.writeFileSync("data.json", jsonData);

        console.log("filtered", filtered)
        const outputPath = 'webdata.xlsx';
        jsonToExcel(filtered, outputPath);
    })
    .catch((error) => {
        console.error("Error:", error);
    });


// fetchEmailAddressesFromWebpage(item.url);








// const puppeteer = require("puppeteer");
// const XLSX = require('xlsx');
// const fs = require("fs")
// async function scrapeWebsite(url) {
//     // console.log(url)

//     const browser = await puppeteer.launch();

//     const page = await browser.newPage();

//     await page.goto(url);

//     const scrapedData = await page.evaluate(() => {

//         const data = [];

//         document.querySelectorAll("div[jscontroller='AtSb']").forEach((result) => {
//             const companyName = result.querySelector("span[class='OSrXXb']").textContent;
//             const phoneNo = result.querySelector(".rllt__details > div:nth-child(4)").textContent;
//             const typeFull = result.querySelector(".rllt__details > div:nth-child(2)").textContent;
//             const linkElement = result.querySelector(".VkpGBb> a");
//             const url = linkElement ? linkElement.getAttribute('href') : null;
//             const typeSplit = typeFull.split('·');
//             const rating = typeSplit[0]?.trim() || '';
//             const companyType = typeSplit[1]?.trim() || '';

//             data.push({ companyName, phoneNo, rating, companyType, url });
//         });
//         return data;

//     });
//     return scrapedData;
// }


// function jsonToExcel(jsonData, outputPath) {
//     const worksheet = XLSX.utils.json_to_sheet(jsonData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
//     if (fs.existsSync(outputPath)) {
//         fs.unlinkSync(outputPath)
//     }
//     XLSX.writeFile(workbook, outputPath);
// }

// // const webLinks = ["https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.33499825202238,77.637743889984],[23.175390896130015,77.31296056478868]];start:20"]

// const webLinks = [
//     "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.2817135,77.4721435],[23.2112946,77.3654609]]",
//     "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.2587431,77.50704549999999],[23.176632599999998,77.3862597]];start:20",
//     "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.279731599999998,77.4986066],[23.1970234,77.4177693]];start:40",
//     "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.297322599999998,77.505481],[23.1622366,77.3723692]];start:60"]


// const webArr = webLinks.map(async (item, index) => {
//     return scrapeWebsite(item)
//         .then((data) => {
//             const filtered = data.map(item => {
//                 const firstSegment = item.phoneNo.split("⋅")[1];

//                 const finalSegment = firstSegment?.split("·")[1];

//                 return { companyName: item.companyName, phoneNo: finalSegment, rating: item.rating, companyType: item.companyType, url: item.url };
//             });
//             console.log("filtered",filtered)
//             const jsonData = JSON.stringify(filtered, null, 2);
//             fs.writeFileSync("data.json", jsonData);

//             const outputPath = 'webdata.xlsx';
//             jsonToExcel(filtered, outputPath);
//         })
//         .catch((error) => {
//             console.error("Error:", error);
//         });
// })
// Promise.all(webArr)
//     .then((results) => {
//         console.log("results", results)
//     })



if(fs.existsSync(outputPath)){
    fs.unlinkSync(outputPath)
}

const puppeteer = require("puppeteer");
const XLSX = require('xlsx');
const fs = require("fs")
// const links = require("./link")



const webLinks = [
    "https://www.google.com/search?sca_esv=569384727&tbs=lrf:!1m4!1u3!2m2!3m1!1e1!1m4!1u2!2m2!2m1!1e1!2m1!1e2!2m1!1e3!3sIAE,lf:1,lf_ui:2&tbm=lcl&sxsrf=AM9HkKlcAZZ6b4qsYnBL-OxJzFzpIaF6PQ:1695974069172&q=php%20company%20in%20bhopal&rflfq=1&num=10&rllag=23242092,77449537,2099&sa=X&ved=2ahUKEwjVv8Pfq8-BAxU6bfUHHTv-DiUQjGp6BAhPEAE&biw=2049&bih=550&dpr=1.25&rlst=f#rlfi=hd:;si:;mv:[[23.2817135,77.4721435],[23.2112946,77.3654609]];tbs:lrf:!1m4!1u3!2m2!3m1!1e1!1m4!1u2!2m2!2m1!1e1!2m1!1e2!2m1!1e3!3sIAE,lf:1,lf_ui:2",
    "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.33499825202238,77.637743889984],[23.175390896130015,77.31296056478868]];start:20",
    "https://www.google.com/search?q=php+company+in+bhopal&sca_esv=569384727&biw=1366&bih=651&tbm=lcl&sxsrf=AM9HkKmv44tw4F3M50v741PIHwjmDkwbZg%3A1695974351245&ei=z4MWZcjBDuKv0-kP_biOgAE&ved=0ahUKEwiI5YPmrM-BAxXi1zQHHX2cAxAQ4dUDCAk&uact=5&oq=php+company+in+bhopal&gs_lp=Eg1nd3Mtd2l6LWxvY2FsIhVwaHAgY29tcGFueSBpbiBiaG9wYWwyBxAjGK4CGCdI9QNQAFgAcAB4AJABAJgBxQKgAcUCqgEDMy0xuAEDyAEAiAYB&sclient=gws-wiz-local#rlfi=hd:;si:;mv:[[23.33499825202238,77.637743889984],[23.175390896130015,77.31296056478868]];start:40"]

console.log("links",webLinks)

async function scrapeWebsite(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const scrapedData = await page.evaluate(() => {
        const data = [];
        document.querySelectorAll(".fl").forEach((moredata) => {
            moredata.querySelectorAll("div[jscontroller='AtSb']").forEach((result) => {
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
        });
        return data;
    });

    await browser.close();

    return scrapedData;
}


async function scrapeWebsite(url) {

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(url);

    const scrapedData = await page.evaluate(() => {

        const data = [];
        document.querySelectorAll(".AaVjTc tr").forEach((moredata) => {
            moredata.document.querySelectorAll("div[jscontroller='AtSb']").forEach((result) => {
            const companyName = result.querySelector("span[class='OSrXXb']").textContent;
            const phoneNo = result.querySelector(".rllt__details > div:nth-child(4)").textContent;
            const typeFull = result.querySelector(".rllt__details > div:nth-child(2)").textContent;
            const linkElement = result.querySelector(".VkpGBb> a");
             const url = linkElement ? linkElement.getAttribute('href') : null;




             const typeSplit = typeFull.split('·');
            const rating = typeSplit[0]?.trim() || '';
            const companyType = typeSplit[1]?.trim() || '';

            data.push({ companyName, phoneNo, rating, companyType ,url});
        });
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

    XLSX.writeFile(workbook, outputPath);
}

// const websiteURL = "https://www.google.com/search?sca_esv=569062438&tbs=lf:1,lf_ui:2&tbm=lcl&sxsrf=AM9HkKl3_7CmPgXeee4CzePyo8nBHVYlWg:1695881600835&q=php+company+in+bhopal&rflfq=1&num=10&rllag=23242092,77449537,2099&sa=X&ved=2ahUKEwjGipij08yBAxWYe_UHHe4rCB4QjGp6BAhPEAE&biw=1093&bih=230&dpr=1.25#rlfi=hd:;si:;mv:[[25.817707621675904,106.39655697028951],[19.742430861517697,72.60261165778951]]";
const webArr = webLinks.map(item=> {
    scrapeWebsite(item)
    .then((data) => {
       
        const filtered = data.map(item => {
            const firstSegment = item.phoneNo.split("⋅")[1];

            const finalSegment = firstSegment?.split("·")[1];

            return { companyName: item.companyName, phoneNo: finalSegment, rating: item.rating, companyType: item.companyType ,url:item.url};
        });
        const jsonData = JSON.stringify(filtered, null, 2);
        // fs.writeFileSync("moredata.json", jsonData);

        console.log("filtered", filtered)
        const outputPath = 'moredata.xlsx';
        jsonToExcel(filtered, outputPath);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
})

// scrapeWebsite(websiteURL)
//     .then((data) => {
       
//         const filtered = data.map(item => {
//             const firstSegment = item.phoneNo.split("⋅")[1];

//             const finalSegment = firstSegment?.split("·")[1];

//             return { companyName: item.companyName, phoneNo: finalSegment, rating: item.rating, companyType: item.companyType ,url:item.url};
//         });
//         const jsonData = JSON.stringify(filtered, null, 2);
//         fs.writeFileSync("moredata.json", jsonData);

//         console.log("filtered", filtered)
//         const outputPath = 'moredata.xlsx';
//         jsonToExcel(filtered, outputPath);
//     })
//     .catch((error) => {
//         console.error("Error:", error);
//     });