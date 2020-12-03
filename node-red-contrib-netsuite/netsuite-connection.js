module.exports = function(RED) {
  function NetsuiteConnection(n) {
      RED.nodes.createNode(this,n);
      this.consumerKey = n.consumerKey;
      this.consumerSecret = n.consumerSecret;
      this.tokenKey = n.tokenKey;
      this.tokenSecret = n.tokenSecret;
      this.baseUrl = n.baseUrl;
      this.realm = n.realm;
  }
  RED.nodes.registerType("netsuite-connection",NetsuiteConnection);
}