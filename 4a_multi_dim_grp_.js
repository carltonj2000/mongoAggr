const util = require("util");
const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const pipeline = [
      { $match: { metacritic: { $gte: 0 }, "imdb.rating": { $gte: 0 } } },
      {
        $project: { _id: 0, metacritic: 1, imdb: 1, title: 1 },
      },
      {
        $facet: {
          top_metacritic: [
            { $sort: { metacritic: -1, title: 1 } },
            { $limit: 10 },
            //{ $project: { title: 1 } },
          ],
          top_imdb: [
            { $sort: { "imdb.rating": -1, title: 1 } },
            { $limit: 10 },
            { $project: { title: 1 } },
          ],
        },
      },
      {
        $project: {
          movies_in_both: {
            $setIntersection: ["$top_metacritic", "$top_imdb"],
          },
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
