module.exports = function(RED) {

  const ExternalJira = require('@atlassian/jira')

  async function _jql(jira, jql, batchSize = 50, pageIndex = 0, data) {
    return _jqlPage(jira, jql, batchSize, pageIndex)
      .then(response => {
        if (!data) data = []

        data = data.concat(response.data.issues)
        const next = response.data.startAt + response.data.maxResults
        if (next < response.data.total) {
          return _jql(jira, jql, batchSize, next, data)
        }
        return data
      })
  }

  async function _jqlStream(node, jira, jql, batchSize = 50, pageIndex = 0) {
    return _jqlPage(jira, jql, batchSize, pageIndex)
      .then(response => {
        const next = response.data.startAt + response.data.maxResults

        const msg = {
          query: jql,
          startAt: response.data.startAt,
          total: response.data.total,
          maxResults: response.data.maxResults,
          count: response.data.issues.length || 0,
          payload: response.data.issues
        }
        node.status({fill:"green",shape:"dot",text:`connected: ${response.data.startAt} / ${msg.total}`});
        node.send(msg);

        if (next < response.data.total) {
          return _jqlStream(node, jira, jql, response.data.maxResults, next)
        }
        return
      })
  }

  async function _jqlPage(jira, jql, batchSize, pageIndex) {
    return jira.search.searchForIssuesUsingJqlGet({
      jql: jql,
      maxResults: batchSize,
      startAt: pageIndex,
      expand: 'editmeta,changelog'
    })
  }

  function Query(config) {
    RED.nodes.createNode(this,config);
    this.connection = RED.nodes.getNode(config.connection);
    var node = this;

    this.on('input', async function(msg) {
      node.status({fill:"green",shape:"ring",text:"initializing...."});

      if (msg.hasOwnProperty("query") && config.query === '') {
        config.query = msg.query;
      }

      const jira = new ExternalJira({
        baseUrl: this.connection.baseUrl,
        headers: {},
        options: {
          timeout: this.connection.timeout || 36000
        }
      })

      jira.authenticate({
        type: 'basic',
        username: this.connection.username,
        password: this.connection.password
      })

      node.status({fill:"green",shape:"ring",text:"connecting...."});

      let result
      try {
        result = await _jqlStream(node, jira, config.query, config.batchSize)

        //msg.total = result
        //msg.count = result.length || 0
        //msg.payload = result
        //node.send(msg);
        node.status({});
      } catch(err) {
        node.status({fill:"red",shape:"dot",text:"Error"});
        node.error(err);
      }
    });
  }
  RED.nodes.registerType("jql",Query);

}