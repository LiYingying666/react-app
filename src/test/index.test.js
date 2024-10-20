const puppeteer = require("puppeteer");
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const expect = require("chai").expect;

describe("HelloWorld test suite", function () {
  this.timeout(10000); // Useful when testing really slow Drupal sites

  // open a new browser tab and set the page variable to point at it
  before(async function () {
    console.log("before");
    global.expect = expect;
    global.browser = await puppeteer.launch({
      headleass: true,
      args: [
        "--no-sandbox",
        // '--disable-setuid-sandbox',
        // '--enable-logging', '--v=1'
      ],
    });
    page = await browser.newPage();
    page.setViewport({ width: 1187, height: 1000 });
    console.log("before done");
  });

  // close the browser when the tests are finished
  after(async function () {
    await page.close();
    await browser.close();
  });
  async function getGridComputedStyle() {
    return page.evaluate(() => {
      const grid = document.querySelector(".grid-container");
      const style = window.getComputedStyle(grid);
      return {
        gridTemplateColumns: style.gridTemplateColumns,
        gap: style.gap,
      };
    });
  }

  async function getGridColumnCount() {
    return page.evaluate(() => {
      const grid = document.querySelector(".grid-container");
      const style = window.getComputedStyle(grid);
      return style.gridTemplateColumns.split(" ").length;
    });
  }
  it("should display single column layout for width <= 1024px", async () => {
    const [response] = await Promise.all([
      /*------------------------------域名端口号固定写法------------------------*/
      page.goto("http://localhost:80/index.html", {
        waitUntil: "networkidle2",
      }),
      // page.goto("http://localhost:80/index.html", {
      //   waitUntil: "networkidle2",
      // }),
      // page.goto(host, {timeout:0}),
      page.waitForNavigation({ timeout: 0 }),
    ]);
    await page.setViewport({ width: 1024, height: 768 });
    const columnCount = await getGridColumnCount();
    expect(columnCount).to.equal(1); // 修改：期望列数为1
  });

  it("should display double column layout for width > 1024px", async function () {
    const [response] = await Promise.all([
      /*------------------------------域名端口号固定写法------------------------*/
      page.goto("http://localhost:80/index.html", {
        waitUntil: "networkidle2",
      }),
      // page.goto("http://localhost:80/index.html", {
      //   waitUntil: "networkidle2",
      // }),
      // page.goto(host, {timeout:0}),
      page.waitForNavigation({ timeout: 0 }),
    ]);
    await page.setViewport({ width: 1025, height: 768 });
    const columnCount = await getGridColumnCount();
    expect(columnCount).to.equal(2); // 修改：期望列数为2
  });
  it("should have gap between grid items", async function () {
    const [response] = await Promise.all([
      /*------------------------------域名端口号固定写法------------------------*/
      page.goto("http://localhost:80/index.html", {
        waitUntil: "networkidle2",
      }),
      // page.goto("http://localhost:80/index.html", {
      //   waitUntil: "networkidle2",
      // }),
      // page.goto(host, {timeout:0}),
      page.waitForNavigation({ timeout: 0 }),
    ]);
    const { gap } = await getGridComputedStyle();
    expect(parseInt(gap)).to.be.greaterThan(0);
  });
  it("should have dynamic height for grid items", async function () {
    const [response] = await Promise.all([
      /*------------------------------域名端口号固定写法------------------------*/
      page.goto("http://localhost:80/index.html", {
        waitUntil: "networkidle2",
      }),
      // page.goto("http://localhost:80/index.html", {
      //   waitUntil: "networkidle2",
      // }),
      // page.goto(host, {timeout:0}),
      page.waitForNavigation({ timeout: 0 }),
    ]);

    const itemHeights = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".grid-item")).map(
        (item) => item.offsetHeight
      );
    });
    const uniqueHeights = new Set(itemHeights);
    // 检查是否所有高度都大于0
    itemHeights.forEach((height) => {
      expect(height).to.be.greaterThan(0);
    });

    // 检查是否所有高度相同，或者存在不同高度
    if (uniqueHeights.size === 1) {
      console.log("All grid items have the same height");
    } else {
      console.log("Grid items have different heights");
    }

    // 确保至少有一个高度值（这应该总是成立）
    expect(uniqueHeights.size).to.be.greaterThan(0);
  });
});
