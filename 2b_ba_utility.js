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
          languages: { $in: ["English"] },
          "imdb.rating": { $gte: 1 },
          "imdb.votes": { $gte: 1 },
          year: { $gte: 1990},
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          "imdb.rating": 1,
          "imdb.votes": 1,
          scaled_votes:  {
            $add: [
              1,
              {
                $multiply: [
                  9,
                  {
                    $divide: [
                      { $subtract: ["$imdb.votes", 5] },
                      { $subtract: [1521105, 5] }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          title: 1,
          normalized_rating: {$avg: ["$scaled_votes", "$imdb.rating"]}
        }
      },
      {
        $sort: {"normalized_rating": 1}
      },
      {
        $limit: 2
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
