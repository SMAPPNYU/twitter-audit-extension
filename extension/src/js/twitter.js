import { parseTweetHTML } from "./twitter_parser";

/*
 * Given an array of childNodes create a parsed array of tweet objects
 */
const parseTweets = function (children) {
  let prevNode = null;
  const tweets = [];
  for (let i = 0; i < children.length; i++) {
    const tweet = parseTweetHTML(children[i], prevNode);

    tweets.push(tweet);
    prevNode = tweet;
  }
  return tweets;
};

/*
 * Set up an IntersectionObserver for any tweets that don't have one
 * This way we can actually know if a tweet enters the viewport or not
 */
const monitorTweets = function (tweets, logger) {
  for (const tweet of tweets) {
    if (tweet) {
      if (!tweet.nodes.node.getAttribute("hasObserver")) {
        let observer = new IntersectionObserver(
          function (entries) {
            // isIntersecting is true when element and viewport are overlapping
            // isIntersecting is false when element and viewport don't overlap
            if (entries[0].isIntersecting === true) {
              console.log("Logging view of ", tweet);
              logger.logEvent(tweet.data, "view");
            }
          },
          { threshold: [0.2] }
        );
        observer.observe(tweet.nodes.node);
        tweet.nodes.node.setAttribute("hasObserver", true);
      }
    }
  }
};

/*
 * Where the magic happens. Parse the twitter feed, remove tweets if needed, add tweets if needed,
 * and log the whole thing
 *
 * Treatment group here doesn't actually do anything FYI
 */
const processFeed = function (document, observer, treatment_group, logger) {
  let timelineDiv = document.querySelector(
    '[aria-label="Timeline: Your Home Timeline"]'
  );
  if (
    timelineDiv != undefined &&
    timelineDiv.childNodes[0].childNodes.length > 1
  ) {
    // disable the observer when modifying itself, otherwise its infinite loop
    observer.disconnect();

    const parentNode = timelineDiv.childNodes[0];
    const children = parentNode.childNodes;
    const tweets = parseTweets(children);
    monitorTweets(tweets, logger);

    // re-register, for when the user scrolls
    const config = {
      attributes: false,
      childList: true,
      subtree: true,
      characterData: true,
    };
    observer.observe(timelineDiv, config);
  }
};

export const getObserver = function (treatment_group, logger) {
  const observer = new MutationObserver(function (mutations) {
    processFeed(document, observer, treatment_group, logger);
  });
  return observer;
};
