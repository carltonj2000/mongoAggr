const util = require("util");
const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const pipeline = [
      {
        $match: {
          airplane: /747|380/,
        },
      },
      {
        $lookup: {
          from: "air_alliances",
          foreignField: "airlines",
          localField: "airline.name",
          as: "alliance",
        },
      },
      {
        $unwind: "$alliance",
      },
      {
        $group: {
          _id: "$alliance.name",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    const aggreCursor = client
      .db("aggregations")
      .collection("air_routes")
      .aggregate(pipeline);
    let count = 0;
    await aggreCursor.forEach((e) => {
      console.log(e);
      count = count + 1;
    });
    console.log({ count });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    console.log("done");
  }
};

main().catch(console.error);
