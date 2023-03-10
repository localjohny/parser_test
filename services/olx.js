const fetch = require("cross-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const { delay } = require("../helpers");

class Olx {
  constructor() {
    this.defaultUrl = `https://www.olx.kz`;

    this.headers = JSON.parse(
      fs.readFileSync("./credentials/olx.json").toString("utf-8")
    );
  }

  async viewPage(order_id) {
    try {
      const response = await this.request(
        this.defaultUrl,
        `/api/v1/offers/${order_id}/page-views/`,
        "POST"
      );

      const result = await response.json();
      if (response.status !== 200 || !result.data)
        throw new Error(JSON.stringify(result));

      return true;
    } catch (error) {
      console.log("ERROR Olx viewPage", error);
      return false;
    }
  }

  async getPhones(orderId) {
    try {
      const viewPage = await this.viewPage(orderId);
      // console.log("viewPage", viewPage);
      if (!viewPage) throw new Error("ERROR in this.viewPage(orderId)");

      const response = await this.request(
        this.defaultUrl,
        `/api/v1/offers/${orderId}/limited-phones/`,
        "GET"
      );

      const result = await response.json();
      if (response.status !== 200) throw new Error(JSON.stringify(result));

      return result.data.phones.join(", ");
    } catch (error) {
      console.log("ERROR Olx getPhones", error);
      return "undefined";
    }
  }

  async getDataOrder(endpoint) {
    try {
      const response = await this.request(this.defaultUrl, endpoint, "GET");

      const result = await response.text();
      if (response.status !== 200) throw new Error(response.statusText);

      const $ = cheerio.load(result);

      const data = {};

      const about = $(
        "div.css-n9feq4 > div.css-1wws9er > div.css-1m8mzwg > div"
      ).text();
      const order_id = $(
        "div.css-n9feq4 > div.css-1wws9er > div.css-cgp8kk > div > span.css-12hdxwj.er34gjf0"
      )
        .text()
        .split("ID: ")[1];

      data["Order_id"] = order_id;
      data["Name_Order"] = $("h1").text();
      data["Price"] = $("h3").first().text();
      data["About"] = about.replaceAll("  ", "").replaceAll("\n", " ");
      data["Name"] = $(
        "div:nth-child(2) > div > a > div > div.css-1fp4ipz > h4"
      ).text();

      return data;
    } catch (error) {
      console.log("ERROR Olx getDataOrder", error);
      return false;
    }
  }

  async getOrders(number_page, endpoint) {
    try {
      if (number_page > 1) endpoint += `?page=${number_page}`;

      const response = await this.request(this.defaultUrl, endpoint, "GET");

      const result = await response.text();
      if (response.status !== 200) throw new Error(response.statusText);

      const $ = cheerio.load(result);

      const data = [];

      $("div.css-1sw7q4x").each(function (index, element) {
        const link = $(this).find("a.css-rc5s2u").attr("href");

        if (link) {
          data.push(link);
        }
      });

      return data;
    } catch (error) {
      console.log("ERROR Olx getOrders", error);
      return false;
    }
  }

  async request(url, endpoint, method = "GET", data = null) {
    const options = {
      method,
      headers: this.headers,
    };

    if (data !== null) {
      options["body"] = data;
    }

    // console.log(url + endpoint, options);

    await delay(1000 * 5);
    return fetch(url + endpoint, options);
  }
}

module.exports = Olx;
