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
          languages: "English",
        },
      },
      {
        $project: { _id: 0, cast: 1, "imdb.rating": 1 },
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
        $project: {
          numFilms: 1,
          average: {
            $divide: [{ $trunc: { $multiply: ["$average", 10] } }, 10],
          },
        },
      },
      {
        $sort: { numFilms: -1 },
      },
      {
        $limit: 1,
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
