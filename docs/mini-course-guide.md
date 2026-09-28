# Mini-course guide

Lessons are uploaded as one HTML file and served from `https://lessons.celpipdecoded.com`. The main site embeds them in an iframe whose sandbox is only `allow-scripts`. The lesson origin does not receive the main site cookie.

## Message

```js
window.parent.postMessage({
  type: "celpip-lesson",
  version: 1,
  event: "start", // or "drill" or "finish"
  lesson_id: "grammar-gym",
  drill_id: "d1",
  score: 8,
  max_score: 10
}, "*");
```

The parent checks `event.origin` and ignores every other shape.

## Helper

Link `/shared/celpip-lesson.v1.js` from the lesson origin, then call:

```js
CelpipLesson.start();
CelpipLesson.drill("d1", 8, 10);
CelpipLesson.finish(80, 100);
```

## Styles

Link `/shared/celpip-lesson.v1.css`. It is built for a 375px wide frame with no sideways scrolling.

## Checklist before publish

- Single HTML file, 5 MB or under
- Helper script is included, or the upload warning is accepted
- No script tag pointing at another site
- Preview in the sandbox and watch the report-back panel
- A start, a drill, and a finish arrive for the signed-in student
