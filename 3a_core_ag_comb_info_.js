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
          awards: /Won \d{1,2} Oscars?/,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$imdb.rating" },
          min: { $min: "$imdb.rating" },
          max: { $max: "$imdb.rating" },
          stdDevSamp: { $stdDevSamp: "$imdb.rating" },
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
