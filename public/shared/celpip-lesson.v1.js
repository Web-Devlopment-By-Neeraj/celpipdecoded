(function () {
  function send(eventName, extra) {
    var params = new URLSearchParams(window.location.search);
    var message = {
      type: "celpip-lesson",
      version: 1,
      event: eventName,
      lesson_id: params.get("lesson") || "",
    };
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        message[key] = extra[key];
      });
    }
    window.parent.postMessage(message, "*");
  }

  window.CelpipLesson = {
    start: function () {
      send("start");
    },
    drill: function (drillId, score, maxScore) {
      send("drill", { drill_id: drillId, score: score, max_score: maxScore });
    },
    finish: function (score, maxScore) {
      send("finish", { score: score, max_score: maxScore });
    },
  };
})();
