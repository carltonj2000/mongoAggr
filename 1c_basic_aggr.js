const util = require("util");
const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const pipeline = [
      {
        $project: {
          _id: 0,
          title: "$title",
          split: { $size: { $split: ["$title", " "] } },
        },
      },
      {
        $match: {
          split: { $eq: 1 },
        },
      },
    ];

    const aggreCursor = client
      .db("aggregations")
      .collection("movies")
      .aggregate(pipeline);
    let count = 0;
    await aggreCursor.forEach((e) => {
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
