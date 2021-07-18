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
          title: 1,
          cast: 1,
          directors: 1,
          writersOld: "$writers",
          writers: {
            $map: {
              input: "$writers",
              as: "writer",
              in: {
                $arrayElemAt: [
                  {
                    $split: ["$$writer", " ("],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          cast: 1,
          directors: 1,
          writers: 1,
          common: { $setIntersection: ["$cast", "$directors", "$writers"] },
        },
      },
      {
        $match: {
          common: { $ne: null },
        },
      },
      {
        $project: {
          title: 1,
          cast: 1,
          directors: 1,
          writers: 1,
          common: 1,
          commonSz: { $size: "$common" },
        },
      },
      {
        $match: {
          commonSz: { $gt: 0 },
        },
      },
      /*
      {
        $limit: 10,
      },
      */
      {
        $count: "count",
      },
    ];

    const aggreCursor = client
      .db("aggregations")
      .collection("movies")
      .aggregate(pipeline);
    await aggreCursor.forEach(console.log);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    console.log("done");
  }
};

main().catch(console.error);
