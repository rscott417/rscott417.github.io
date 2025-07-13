---
title: More notes on AI search
subtitle: What happens next
layout: blog
---

Testing bsky comments from here: https://www.coryzue.com/writing/bluesky-comments/

<div id="bluesky-comments"></div>



<link rel="stylesheet" href="https://unpkg.com/bluesky-comments/dist/bluesky-comments.css">


<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client"
  }
}
</script>
<!-- Then your module script can use bare specifiers -->
<script type="module">
  import { createElement } from 'react';
  import { createRoot } from 'react-dom/client';

  import {BlueskyComments, BlueskyFilters} from 'https://unpkg.com/bluesky-comments@0.11.0/dist/bluesky-comments.es.js';


  const uri = 'https://bsky.app/profile/tomcritchlow.com/post/3lmdxrq2wsc2v';
  const author = 'coryzue.com';
  const container = document.getElementById('bluesky-comments');
  const root = createRoot(container);

  root.render(
    createElement(BlueskyComments, {
      author: author,
      uri: uri,
      commentFilters: [
        BlueskyFilters.NoPins,
      ],
      onEmpty: (details) => {
        console.log('Failed to load comments:', details);
        document.getElementById('bluesky-comments').innerHTML =
          '<p class="has-text-centered has-text-grey">Comments have not been turned on for this post yet.</p>';
      },
    })
  );
</script>

     