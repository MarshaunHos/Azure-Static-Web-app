const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.CosmosDbConnectionString);
const container = client.database("VisitorCounterDB").container("Counter");

module.exports = async function (context, req) {
    const id = "1";
    let count = 1;

    // read the counter; resource is undefined if it doesn't exist yet
    const { resource } = await container.item(id, id).read();
    if (resource) {
        count = resource.count + 1;   // it exists -> add one
    }
    // if resource was undefined, count stays 1 (first visitor)

    // save the new total (creates the document on the first run)
    await container.items.upsert({ id: id, count: count });

    context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: { count: count }
    };
};
