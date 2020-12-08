# Node-RED Jira Streams

## Using JQL

Either pass in msg.query or specify a query in the configuration of the node. Example:

```
status = "In Progress"
```

After execution, the msg.count and msg.payload will be populated