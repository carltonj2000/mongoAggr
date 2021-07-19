const util = require("util");
const { MongoClient } = require("mongodb");

const favorites = [
  "Sandra Bullock",
  "Tom Hanks",
  "Julia Roberts",
  "Kevin Spacey",
  "George Clooney"];

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const pipeline = [
      {
        $match: {
          countries: { $in: ["USA"] },
          "tomatoes.viewer.rating": { $gte: 3 },
          cast: { $in: favorites},
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          cast: 1,
          "tomatoes.viewer.rating": 1,
          num_favs:  {$size: { $setIntersection: ["$cast", favorites]}}
        }
      },
      {
        $sort: {"num_favs": -1, "tomatoes.viewer.rating": -1, "title" : -1}
      },
      {
        $limit: 25
      }
    ];

    const aggreCursor = client
      .db("aggregations")
      .collection("movies")
      .aggregate(pipeline);
    let count = 0;
    await aggreCursor.forEach((e) => {
      console.log(e)
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
