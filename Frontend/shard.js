const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27030/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function test() {
  try {
    await client.connect();
    console.log("Connected to MongoDB cluster");
    const database = client.db("School");
    const collection = database.collection("students");

    const pipeline = [
      { $unwind: "$scores" },
      { $match: { "scores.type": "exam" } },
      { $sort: { "scores.score": -1 } },
      {
        $group: {
          _id: null,
          topScore: { $push: "$scores.score" },
        },
      },
      {
        $project: {
          _id: 0,
          topScore: { $slice: ["$topScore", 10] },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    console.log(result);
  } catch (error) {
    console.error("Error connecting to MongoDB cluster", error);
  } finally {
    await client.close();
  }
}

test();
