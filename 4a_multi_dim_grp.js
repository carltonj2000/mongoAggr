const util = require("util");
const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const limit = 10;
    const pipeline = [
      { $match: { metacritic: { $gte: 0 }, "imdb.rating": { $gte: 0 } } },
      {
        $facet: {
          metacritic: [
            { $project: { _id: 0, title: 1, metaRating: "$metacritic" } },
            { $sort: { metaRating: -1 } },
            { $limit: limit },
            { $project: { title: 1 } },
          ],
          imdbRating: [
            { $project: { _id: 0, title: 1, imdbRating: "$imdb.rating" } },
            { $sort: { imdbRating: -1 } },
            { $limit: limit },
            { $project: { title: 1 } },
          ],
        },
      },
      {
        $project: {
          in_both: { $setIntersection: ["$imdbRating", "$metacritic"] },
        },
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
