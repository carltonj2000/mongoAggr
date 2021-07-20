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
          languages: { $in: ["English"] },
          $and: [{ cast: { $ne: null } }, { cast: { $ne: [] } }],
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          cast: 1,
          "imdb.rating": 1,
        },
      },
      {
        $unwind: "$cast",
      },
      {
        $group: {
          _id: "$cast",
          numFilms: { $sum: 1 },
          average: { $avg: "$imdb.rating" },
        },
      },
      {
        $sort: { numFilms: -1 },
      },
      {
        $limit: 2,
      },
    ];

    const aggreCursor = client
      .db("aggregations")
      .collection("movies")
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
