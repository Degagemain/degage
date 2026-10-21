// @google/genai and PostHog declare an optional peer on the v1 MCP SDK.
// We use @modelcontextprotocol/server instead. Leaving the peer installed
// pulls that SDK back in, and with it the vulnerable Hono and proxy-addr copies.
const stripMcpSdkPeer = (pkg) => {
  if (!pkg.peerDependencies?.['@modelcontextprotocol/sdk']) return;
  delete pkg.peerDependencies['@modelcontextprotocol/sdk'];
  if (pkg.peerDependenciesMeta) {
    delete pkg.peerDependenciesMeta['@modelcontextprotocol/sdk'];
  }
};

const hook = (pkg) => {
  if (pkg.name === '@google/genai' || pkg.name === '@posthog/ai' || pkg.name === '@posthog/mcp') {
    stripMcpSdkPeer(pkg);
  }
  return pkg;
};

module.exports = {
  hooks: {
    readPackage: hook,
  },
};
