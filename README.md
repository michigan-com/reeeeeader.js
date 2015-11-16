# reeeeeader.js

Michigan.com's speed reader web component. See a demo at [speed.detroitnow.io](http://speed.detroitnow.io/).


## Installation

```sh
npm install reeeeeader --save
```


## Usage

Instantiate the controller and display the popup:

```js
import {ReadingPopupController} from 'reeeeeader';

function openSpeedReeeeeader() {
    let controller = new ReadingPopupController();
    controller.setArticle({
        id: 123,  // optional
        headline: "Foo",
        body: "Sample article body",
    })
}
```

Asynchronous loading:

```js
import {ReadingPopupController} from 'reeeeeader';
import xr from 'xr';
import done from 'promise-done';

function openSpeedReeeeeader(articleId) {
    let controller = new ReadingPopupController();

    // displays the loading indicator
    controller.setLoadingState();

    // load the actual data... 
    let promise = xr.get('/articles/%'.replace('%', encodeURIComponent(articleId)));

    promise.then((article) => {
        controller.setArticle(article);
    }).catch(done);
}
```


## Styles

Include styles from `reeeeeader/dist/styles.css` into your app's stylesheet. In LESS:

```less
@import (inline) '../node_modules/reeeeeader/dist/styles.css';
```

All CSS classes and DOM IDs are prefixed with `michspeed-` to avoid conflicts.


## License & Copyright

Copyright 2015, Michigan.com.

Distributed under the terms of the MIT license, see the [LICENSE](LICENSE) file for details.
