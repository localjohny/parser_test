const fetch = require("cross-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const { delay } = require("../helpers");

class Kolesa {
  constructor() {
    this.defaultUrl = `https://kolesa.kz`;
    this.appUrl = `https://app.kolesa.kz`;

    this.headers = JSON.parse(
      fs.readFileSync("./credentials/kolesa.json").toString("utf-8")
    );
  }

  async getPhones(orderId) {
    try {
      const response = await this.request(
        this.appUrl,
        `/adverts/${orderId}/phones`,
        "GET"
      );

      const result = await response.json();
      if (response.status !== 200) throw new Error(await response.text());

      if (result.status === "success") {
        return result.phones.join(", ");
      } else if (result.captchaRequired) {
        // if captcha resolve this

        console.log(result);
        throw new Error("captchaRequired");
      }

      return "undefined";
    } catch (error) {
      console.log("ERROR Kolesa getPhones", error);
      return "undefined";
    }
  }

  async getDataOrder(endpoint) {
    try {
      const response = await this.request(this.defaultUrl, endpoint, "GET");

      const result = await response.text();
      if (response.status !== 200) throw new Error(result);

      const $ = cheerio.load(result);

      const data = {};

      const orderId = endpoint.split("show/")[1];

      data["Order_id"] = orderId;

      data["Brand"] = $(
        "body > main > div > div > div > header > div.offer__header-wrap > h1 > span:nth-child(1)"
      ).text();

      data["Model"] = $(
        "body > main > div > div > div > header > div.offer__header-wrap > h1 > span:nth-child(2)"
      ).text();

      data["Year"] = $(
        "body > main > div > div > div > header > div.offer__header-wrap > h1 > span.year"
      ).text();

      const about = $(
        "body > main > div > div > div > section > div.offer__content > div.offer__description > div.text"
      ).text();

      data["About"] = about.replaceAll("  ", "").replaceAll("\n", " ");

      return data;
    } catch (error) {
      console.log("ERROR Kolesa getInfoOrder", error);
      return false;
    }
  }

  async getOrders(number_page, endpoint) {
    try {
      if (number_page > 1) endpoint += `?page=${number_page}`;

      const response = await this.request(this.defaultUrl, endpoint, "GET");

      const result = await response.text();
      if (response.status !== 200) throw new Error(result);

      const $ = cheerio.load(result);

      const data = [];

      $("div.a-list__item").each(function (index, element) {
        const link = $(this).find("a.a-card__link").attr("href");

        if (link) {
          data.push(link);
        }
      });

      return data;
    } catch (error) {
      console.log("ERROR Kolesa getOrders", error);
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

    await delay(1000 * 5);
    return fetch(url + endpoint, options);
  }
}

module.exports = Kolesa;
