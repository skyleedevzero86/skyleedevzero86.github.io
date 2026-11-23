function showDetails(component, details) {
  document.getElementById("detailModalTitle").textContent =
    component + " 상세 정보";
  document.getElementById("detailModalBody").textContent = details;
}

function refreshResults() {
  location.reload();
}

setInterval(refreshResults, 60000);

