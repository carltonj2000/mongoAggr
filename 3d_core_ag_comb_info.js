const util = require("util");
const { MongoClient } = require("mongodb");

const main = async () => {
  const uri = "mongodb://renderws.local/aggregations";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const pipeline = [
      {
        $match: { name: "OneWorld" },
      },
      {
        $graphLookup: {
          startWith: "$airlines",
          from: "air_airlines",
          connectFromField: "name",
          connectToField: "name",
          as: "airlines",
          maxDepth: 0,
          restrictSearchWithMatch: {
            country: { $in: ["Germany", "Spain", "Canada"] },
          },
        },
      },
      {
        $graphLookup: {
          startWith: "$airlines.base",
          from: "air_routes",
          connectFromField: "dst_airport",
          connectToField: "src_airport",
          as: "connections",
          maxDepth: 1,
        },
      },
      {
        $project: {
          validAirlines: "$airlines.name",
          "connections.dst_airport": 1,
          "connections.airline.name": 1,
        },
      },
      { $unwind: "$connections" },
      {
        $project: {
          isValid: { $in: ["$connections.airline.name", "$validAirlines"] },
          "connections.dst_airport": 1,
        },
      },
      { $match: { isValid: true } },
      { $group: { _id: "$connections.dst_airport" } },
    ];

    const aggreCursor = client
      .db("aggregations")
      .collection("air_alliances")
      .aggregate(pipeline);
    let count = 0;
    await aggreCursor.forEach((e) => {
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

/*
airlines {
    "airline" : 4,
    "name" : "2 Sqn No 1 Elementary Flying Training School",
    "country" : "United Kingdom",
    "base" : "HGH",
    ...
}
routes {
    "airline" : {
            "id" : 410,
            "name" : "Aerocondor",
            "alias" : "2B",
            "iata" : "ARD"
    },
    "src_airport" : "CEK",
    "dst_airport" : "KZN",
    "airplane" : "CR2",
    ...
}
alliances {
    "name" : "Star Alliance",
    "airlines" : [
            "Air Canada",
            ...
    ],
    ...
}
*/

/*


*/
