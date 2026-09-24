# The MCP server

Lets an assistant check a message, look up a domain or a phone number, or read
Kuwait's registry of genuine official channels. No account, no key, no browser.

```sh
node mcp/asli-mcp.mjs            # reads the live data from asli.3li.info
node mcp/asli-mcp.mjs --local    # reads this repository's docs/data instead
```

It speaks JSON-RPC 2.0 over stdin and stdout, and depends on nothing outside the
Node standard library. If the network fails it falls back to the bundled data
files and says which source it used.

## Adding it to a client

Most MCP clients take a command and arguments. For example:

```json
{
  "mcpServers": {
    "asli": {
      "command": "node",
      "args": ["/path/to/Asli/mcp/asli-mcp.mjs"]
    }
  }
}
```

## The tools

| Tool | What it answers |
| --- | --- |
| `check_message` | Is this message impersonating a Kuwaiti official body, bank or telco? Takes the text, how it arrived and, if known, the sender. Returns listed, impersonation, official or unverified, with the findings and what to do |
| `check_domain` | Does this host belong to an official body, is it in the confirmed scam feed, or does it borrow a brand it does not own? |
| `check_number` | Is this phone number in the scam feed, is it one an official body publishes on its own site and what for, or has the registry never heard of it? |
| `official_channels` | The genuine domains, apps and published channel policies of one body, or of every body in the registry |
| `registry_status` | Counts, build time, and where to download each published format |

The checking logic is the same `docs/checker.js` the website runs, so an
assistant and a person pasting into the check page get the same answer.

## What it will not do

It reports what the registry and the feed actually contain. Sender names are
not documented yet, so it says so rather than guessing, and an unverified sender
comes back as unverified rather than as safe. A number a body publishes is
reported as published, never as proof of who called, because a caller id can be
faked. A shortened link is reported as hidden rather than guessed at, and a link
to a bare numeric address under an official name is reported as impersonation,
because no official body sends one.
