const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    try {
        const conn = process.env.CosmosDbConnectionString;
        if (!conn) {
            context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { error: "CosmosDbConnectionString is NOT set" } };
            return;
        }
        const client = new CosmosClient(conn);
        const container = client.database("VisitorCounterDB").container("Counter");
        const id = "1";
        let count = 1;
        try {
            const { resource } = await container.item(id, id).read();
            count = resource.count + 1;
        } catch (err) {
            if (err.code !== 404) throw err;
        }
        await container.items.upsert({ id: id, count: count });
        context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { count: count } };
    } catch (err) {
        context.res = { status: 200, headers: { "Content-Type": "application/json" }, body: { error: err.message } };
    }
};
