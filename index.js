const { Kolesa, Olx } = require("./services");

const {
  PrismaClient: mainDatabaseClient,
} = require("./prisma/generated/test_database");
const testDatabase = new mainDatabaseClient();

async function parseKolesa(data = []) {
  console.log("Start parse kolesa!");
  const ordersExist = (await testDatabase.Kolesa.findMany()).map(
    (order) => order.Link
  );

  const kolesa = new Kolesa();
  for (let i = 1; i < 10; i++) {
    const orders = await kolesa.getOrders(i, `/cars/avtomobili-s-probegom/`);
    console.log(`Find ${orders.length} orders, parsing...`);

    for (let order of orders) {
      if (data.length >= 50) return console.log("Well done parse kolesa!");

      console.log(`Kolesa`, order);
      if (ordersExist.includes(order)) continue;

      const dataOrder = await kolesa.getDataOrder(order);
      if (!dataOrder) continue;

      dataOrder["Phone_numbers"] = await kolesa.getPhones(dataOrder.Order_id);
      dataOrder["Link"] = order;

      console.log(`New order`, dataOrder);
      data.push(dataOrder);

      await testDatabase.Kolesa.create({ data: dataOrder });
    }
  }
}

async function parseOlx(data = []) {
  console.log("Start parse olx!");
  const ordersExist = (await testDatabase.Olx.findMany()).map(
    (order) => order.Link
  );

  const olx = new Olx();
  for (let i = 1; i < 10; i++) {
    const orders = await olx.getOrders(i, `/d/list/q-air-pods/`);
    console.log(`Find ${orders.length} orders, parsing...`);

    for (let order of orders) {
      if (data.length >= 50) return console.log("Well done parse olx!");

      console.log(`Olx`, order);
      if (ordersExist.includes(order)) continue;

      const dataOrder = await olx.getDataOrder(order);
      if (!dataOrder) continue;

      dataOrder["Phone_numbers"] = await olx.getPhones(dataOrder.Order_id);
      dataOrder["Link"] = order;

      console.log(`New order`, dataOrder);
      data.push(dataOrder);

      await testDatabase.Olx.create({ data: dataOrder });
    }
  }
}

async function main() {
  parseKolesa();
  parseOlx();
}
main();
