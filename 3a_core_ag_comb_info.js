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
          "imdb.votes": { $gte: 1 },
          "imdb.rating": { $gte: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          "imdb.votes": 1,
          "imdb.rating": 1,
          title: 1,
          awardsSplit: { $split: ["$awards", " "] },
        },
      },
      {
        $addFields: {
          won: { $arrayElemAt: ["$awardsSplit", 0] },
          oscars: { $arrayElemAt: ["$awardsSplit", 2] },
        },
      },
      {
        $match: {
          won: { $in: ["Won"] },
          oscars: { $in: ["Oscars.", "Oscar."] },
        },
      },
      {
        $addFields: {
          oscarAmt: {
            $convert: {
              input: { $arrayElemAt: ["$awardsSplit", 1] },
              to: "int",
            },
          },
        },
      },
      {
        $project: {
          awardsSplit: 0,
          won: 0,
          oscars: 0,
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$imdb.rating" },
          min: { $min: "$imdb.rating" },
          max: { $max: "$imdb.rating" },
          stdDevPop: { $stdDevPop: "$imdb.rating" },
          stdDevSamp: { $stdDevSamp: "$imdb.rating" },
        },
      },
      /*
       */
      /*
      {
        $sort: { "imdb.votes": -1 },
      },
      {
        $limit: 2,
      },
       */
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
