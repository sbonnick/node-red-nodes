# Node-RED NetSuite

## Using SuiteQL

Either pass in msg.query or specify a query in the configuration of the node. Example:

```
SELECT id
FROM issue
ORDER BY id DESC
```

After execution, the msg.count and msg.payload will be populated