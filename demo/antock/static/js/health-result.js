function showDetails(component, details) {
  document.getElementById("detailModalTitle").textContent =
    component + " 상세 정보";
  document.getElementById("detailModalBody").textContent = details;
}

function refreshResults() {
  location.reload();
}

// Auto refresh every 60 seconds
setInterval(refreshResults, 60000);

