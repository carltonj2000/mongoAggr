# Mongo DB Aggragation

The information in this repo is base on the
[MongoDB Aggregation Framework Course](https://university.mongodb.com/courses/M121/about).

Some of the notes of this course are also store at
[my plan doc](https://github.com/carltonj2000/plan)
specifically the
[mongo page](https://github.com/carltonj2000/plan/blob/main/docs/mongodb.md).

My edited connection string, that worked for me, using with VSCode MongoDB plugin.
Used mongodb compass to export the data from remote and import it locally.

```bash
mongodb://m121:aggregations@cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?replicaSet=Cluster0-shard-0
```

```bash
mongo "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/aggregations?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl -u m121 -p aggregations --norc
```
