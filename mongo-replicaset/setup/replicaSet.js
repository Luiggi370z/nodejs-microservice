rsconf = {
    _id: "rs1",
    members: [
        { _id: 0, host: "mongo-rs1-1:27017" },
        { _id: 1, host: "mongo-rs1-2:27017" },
        { _id: 2, host: "mongo-rs1-3:27017" },
    ]
}

rs.initiate(rsconf);

rs.conf();