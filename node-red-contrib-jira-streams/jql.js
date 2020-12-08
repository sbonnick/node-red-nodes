module.exports = function(RED) {

  const Jira = require('@atlassian/jira')

  async function _jql(jira, jql, batchSize = 50, pageIndex = 0, data) {
    return this._jqlPage(jira, jql, batchSize, pageIndex)
      .then(response => {
        if (!data) data = []

        data = data.concat(response.data.issues)
        const next = response.data.startAt + response.data.maxResults
        if (next < response.data.total) {
          return this._jql(jira, jql, batchSize, next, data)
        }
        return data
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

    this.on('input', function(msg) {
      node.status({fill:"green",shape:"ring",text:"connecting...."});

      if (msg.hasOwnProperty("query") && config.query === '') {
        config.query = msg.query;
      }

      const jira = new ExternalJira({
        baseUrl: this.connection.baseurl,
        headers: {},
        options: {
          timeout: 36000
        }
      })

      jira.authenticate({
        type: 'basic',
        username: this.connection.username,
        password: this.connection.password
      })

      let result
      try {
        result = await this._jql(jira, config.query, config.batchSize)
        msg.count = result.length || 0
        msg.payload = result
        node.send(msg);
        node.status({});
      } catch(err) {
        node.status({fill:"red",shape:"dot",text:"Error!"});
        node.error(err);
      }
    });
  }
  RED.nodes.registerType("jql",Query);

}