window.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (typeof Chart === "undefined") {
      console.error(
        "Chart.js가 로드되지 않았습니다. 네트워크 연결을 확인해주세요."
      );
      window.dispatchEvent(new Event("chartjs-error"));
    } else {
      console.log("Chart.js가 정상적으로 로드되었습니다.");
    }
  }, 2000);
});

