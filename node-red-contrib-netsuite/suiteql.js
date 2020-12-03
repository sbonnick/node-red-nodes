module.exports = function(RED) {

  const NsApiWrapper = require('netsuite-rest')

  function Query(config) {
    RED.nodes.createNode(this,config);
    this.connection = RED.nodes.getNode(config.connection);
    var node = this;
    this.on('input', function(msg) {

      // show initial status of progress
      node.status({fill:"green",shape:"ring",text:"connecting...."});

      // use msg query if node's query is blank
      if (msg.hasOwnProperty("query") && config.query === '') {
        config.query = msg.query;
      }

      NsApi = new NsApiWrapper({
        consumer_key: this.connection.consumerKey,
        consumer_secret_key: this.connection.consumerSecret,
        token: this.connection.tokenKey,
        token_secret: this.connection.tokenSecret,
        realm: this.connection.realm,
        base_url: this.connection.baseUrl
      })

      NsApi.request({
        path: "query/v1/suiteql",
        method: "POST",
        body: `{ "q": "${config.query}" }`.replace(/ +(?= )/g,'').replace(/\r?\n|\r/g, '')
      })
      .then(response => {
        msg.payload = {
          size: response.data.items.length || 0,
          records: response.data.items
        }
        node.send(msg);
        node.status({});
      })
      .catch((err) => {
        node.status({fill:"red",shape:"dot",text:"Error!"});
        node.error(err);
      });

    });
  }
  RED.nodes.registerType("suiteql",Query);

}