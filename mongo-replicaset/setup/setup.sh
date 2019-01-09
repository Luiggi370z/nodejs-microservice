echo ******************************************************
echo Starting the MongoDB Replica Set
echo ******************************************************
sleep 5 | echo Sleeping
mongo mongodb://mongo-rs1-1:27017 replicaSet.js