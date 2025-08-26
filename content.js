// Block Facebook reels by hiding/removing reel elements
function blockReels() {
  // Selectors for reels (may need updates if Facebook changes their DOM)
  const reelSelectors = [
    '[href*="/reels/"]', // Links to reels
    '[aria-label="Reels"]', // Reels tab/button
    'div[role="feed"] div:has(a[href*="/reels/"])', // Reel posts in feed
    'div[data-pagelet*="Reels"]', // Reels containers
  ];

  reelSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.display = 'none';
    });
  });

  // Hide YouTube Shorts elements
    if (window.location.hostname.includes('youtube.com')) {
      // Do NOT hide Shorts elements on /shorts/* page
      if (!window.location.pathname.startsWith('/shorts')) {
        // Shorts in feed (homepage, subscriptions, etc.)
        document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer, ytd-reel-video-renderer').forEach(el => {
          el.style.display = 'none';
        });
        // Shorts in sidebar (video page)
        document.querySelectorAll('ytd-mini-guide-entry-renderer[aria-label*="Shorts"], a[href^="/shorts"]').forEach(el => {
          el.style.display = 'none';
        });
      }
    }
}

// Run on page load and periodically (in case of dynamic content)
blockReels();
setInterval(blockReels, 2000);

// Remove posts containing 'Follow' mark
function blockFollowPosts() {
  // Look for the specific 'Follow' span element and remove its parent post
  const followSpans = document.querySelectorAll('span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.xlh3980.xvmahel.x1n0sxbx.x1f6kntn.xvq8zen.x1s688f.x1fey0fg');
  followSpans.forEach(span => {
      if (span.textContent.trim() === 'Follow') {
          // Try to find the closest post container
          let post = span.closest('div[role="article"], div[data-pagelet^="FeedUnit_"], div[data-pagelet*="FeedUnit_"]');
          if (!post) {
            // If not found, find the nearest large ancestor div
            let ancestor = span.parentElement;
            while (ancestor && ancestor !== document.body) {
              if (
                ancestor.tagName === 'DIV' &&
                ancestor.offsetHeight > 200 && // arbitrary threshold for post size
                ancestor.offsetWidth > 200
              ) {
                post = ancestor;
                break;
              }
              ancestor = ancestor.parentElement;
            }
          }
          if (post) {
            post.remove();
          }
      }
  });
}

setInterval(blockFollowPosts, 1000);

// Redirect away from /reel/* if user stays for more than 1 minute
function checkReelUrlAndRedirect() {
  const isFacebookReelPage = window.location.hostname.includes('facebook.com') && window.location.pathname.startsWith('/reel/');
  const isYouTubeShortsPage = window.location.hostname.includes('youtube.com') && window.location.pathname.startsWith('/shorts');

  if (isFacebookReelPage || isYouTubeShortsPage) {
    if (!window.__reelBlockerTimerStarted) {
      window.__reelBlockerTimerStarted = true;
      window.__reelBlockerTimeout = setTimeout(() => {
        if (isFacebookReelPage) {
          window.location.href = 'https://www.facebook.com/';
        } else if (isYouTubeShortsPage) {
          window.location.href = 'https://www.youtube.com/';
        }
      }, 60000); // 1 minute
    }
  } else {
    // Reset timer if not on reel/shorts page
    if (window.__reelBlockerTimerStarted) {
      clearTimeout(window.__reelBlockerTimeout);
      window.__reelBlockerTimerStarted = false;
    }
  }
}

setInterval(checkReelUrlAndRedirect, 1000);
