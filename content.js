/**
 *
 * @param {string} name
 * @returns {string}
 */
function remove_spaces(name) {
  return name.replace(/\s+/g, "");
}
/**
 *
 * @param {string} tagged_name
 * @returns {Promise}
 */
async function tag_to_name(tagged_name) {
  const name = remove_spaces(tagged_name);
  const url = "https://www.youtube.com/" + name;
  const new_name = fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      let new_name = doc.querySelector('title').innerHTML;
      new_name = new_name.slice(0, new_name.length - 10);
      console.log(new_name);
      return new_name;
    })
    .catch((error) => {
      console.log(error);
    });
    return new_name;
}

window.onload = async function () {
  console.log("NAME VIEWER SCRIPT ACTIVE");
  /**
   *
   * @returns {Promise}
   */
  function comments_content_node() {
    return new Promise((res, rej) => {
      var existCondition = setInterval(function () {
        const targetElement = document.getElementById("comments");
        if (targetElement !== null) {
          clearInterval(existCondition);
          observe_for_comments(targetElement);
        }
      }, 100); // check every 100ms

      function observe_for_comments(targetElement) {
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            // Check if a new tag has been added
            if (
              mutation.type === "childList" &&
              mutation.addedNodes.length > 0
            ) {
              // Iterate over the added nodes to check if they are tags
              mutation.addedNodes.forEach(function (node) {
                if (node instanceof HTMLElement && node.id === "contents") {
                  // Handle the event when a new tag is created
                  console.log("Contents found!");
                  res(node);
                }
              });
            }
          });
        });
        observer.observe(targetElement, { childList: true, subtree: true });
      }
    });
  }

  const contents_node = await comments_content_node();
  // console.log("comments rendered", contents_node);

  /**
   *
   * @param {HTMLElement} node
   */
async function rename(node) {
    const header_author_HTML = node.querySelector("[id='header-author']");
    let name_HTML;
    // If guy has a tick badge
    if (
      header_author_HTML.querySelector("ytd-author-comment-badge-renderer") !==
      null
    ) {
      name_HTML = header_author_HTML
        .querySelector("ytd-author-comment-badge-renderer")
        .querySelector("yt-formatted-string");
    } else {
      name_HTML = header_author_HTML.querySelector("span");
    }
    const new_name = await tag_to_name(name_HTML.innerHTML);
    name_HTML.innerHTML = new_name;
  }

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      // Check if a new tag has been added
      mutation.addedNodes.forEach(function (node) {
        if (
          node instanceof HTMLElement &&
          node.tagName === "YTD-COMMENT-THREAD-RENDERER"
        ) {
          rename(node);
        }
      });
    });
  });
  observer.observe(contents_node, { childList: true });
};
