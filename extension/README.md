# Twitter Feed Audit via Chrome Extension

This chrome extension monitors tweets seen on twitter.com by the user. Once the extension is registered with a respondent ID (from the extension popup menu), the extension silently records all tweets seen and logs them to Amazon Kinesis.

## Development:

1. To enable logging to Amazon Kinesis, set up `config.js`. See `config.example.js` for an example config.

2. `npm install`

3. `npx webpack --watch`

4. Chrome > Extensions > Load Unpacked > Select `build` folder

5. Register the extension by selecting its icon in the Chrome extensions menu and entering a Respondent ID

## Data logged

See `twitter_parser.js` for code that logs data
