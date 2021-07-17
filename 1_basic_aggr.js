const util = require("util");
const { MongoClient } = require("mongodb");
require("./1_basic_aggre/validateLab1");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const pipeline = [
      {
        $match: {
          "imdb.rating": { $gte: 7 },
          genres: { $nin: ["Crime", "Horror"] },
          rated: { $in: ["PG", "G"] },
          $and: [
            { languages: { $in: ["English"] } },
            { languages: { $in: ["Japanese"] } },
          ],
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
