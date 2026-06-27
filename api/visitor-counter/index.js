const { CosmosClient } = require("@azure/cosmos");

// Connect using the secret we stored in the Static Web App settings
const client = new CosmosClient(process.env.CosmosDbConnectionString);
const container = client.database("VisitorCounterDB").container("Counter");

module.exports = async function (context, req) {
    const id = "1";          // we use a single document to hold the running total
    let count = 1;           // default for the very first visitor

    try {
        // read the existing counter document
        const { resource } = await container.item(id, id).read();
        count = resource.count + 1;       // someone's been here before -> add one
    } catch (err) {
        if (err.code !== 404) throw err;  // 404 = first visit ever; anything else is a real error
    }

    // save the new total (creates the document if it doesn't exist yet)
    await container.items.upsert({ id: id, count: count });

    context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { count: count }
    };
};
