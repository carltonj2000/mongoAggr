const util = require("util");
const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const movie = await client
      .db("aggregations")
      .collection("movies")
      .findOne(
        { title: "Life Is Beautiful" },
        {
          projection: {
            _id: 0,
            cast: 1,
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
        }
      );
    console.log({ movie });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
    console.log("done");
  }
};

main().catch(console.error);
