document.addEventListener("DOMContentLoaded", function () {
  const citySelect = document.getElementById("citySelect");
  const districtSelect = document.getElementById("districtSelect");
  const collectDataBtn = document.getElementById("collectDataBtn");

  if (!citySelect || !districtSelect) {
    return;
  }

  citySelect.addEventListener("change", function () {
    const selectedCity = this.value;
    districtSelect.innerHTML = "<option>구/군 선택</option>";

    if (selectedCity === "seoul") {
      const districts = [
        "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
        "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
        "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "busan") {
      const districts = [
        "강서구", "금정구", "남구", "동구", "동래구", "부산진구", "북구", "사상구",
        "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구", "기장군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "daegu") {
      const districts = [
        "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "incheon") {
      const districts = [
        "계양구", "남구", "남동구", "동구", "부평구", "서구", "연수구", "중구", "강화군", "옹진군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "gwangju") {
      const districts = ["광산구", "남구", "동구", "북구", "서구"];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "daejeon") {
      const districts = ["대덕구", "동구", "서구", "유성구", "중구"];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "ulsan") {
      const districts = ["남구", "동구", "북구", "울주군", "중구"];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "gyeonggi") {
      const districts = [
        "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시",
        "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시",
        "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시",
        "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "gangwon") {
      const districts = [
        "강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군",
        "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군",
        "화천군", "횡성군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "chungbuk") {
      const districts = [
        "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군",
        "진천군", "청주시", "충주시"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "chungnam") {
      const districts = [
        "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군",
        "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "jeonbuk") {
      const districts = [
        "고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군",
        "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "jeonnam") {
      const districts = [
        "강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시",
        "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군",
        "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "gyeongbuk") {
      const districts = [
        "경산시", "경주시", "고령군", "구미시", "군위군", "김천시", "문경시", "봉화군",
        "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군",
        "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "gyeongnam") {
      const districts = [
        "거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군",
        "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군",
        "함양군", "합천군"
      ];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    } else if (selectedCity === "jeju") {
      const districts = ["서귀포시", "제주시"];
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    }
  });

  if (collectDataBtn) {
    collectDataBtn.addEventListener("click", function () {
      const selectedCity = citySelect.value;
      const selectedDistrict = districtSelect.value;

      if (selectedCity === "city" || selectedDistrict === "구/군 선택") {
        alert("시/도와 구/군을 모두 선택해주세요.");
        return;
      }

      const cityName = getCityDisplayName(selectedCity);
      const districtName = selectedDistrict;

      const btn = this;
      const originalText = btn.textContent;
      btn.textContent = "데이터 수집 중...";
      btn.disabled = true;

      const csrfToken = document
          .querySelector('meta[name="_csrf"]')
          .getAttribute("content");
      const csrfHeader = document
          .querySelector('meta[name="_csrf_header"]')
          .getAttribute("content");

      const headers = {
        "Content-Type": "application/json",
      };

      if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
      }

      fetch("/coseller/save-simple", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          city: cityName,
          district: districtName,
        }),
      })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const savedCount = data.data || 0;
              alert(
                  `데이터 수집이 완료되었습니다.\n저장된 데이터: ${savedCount}건`
              );
              updateStats();
            } else {
              alert(`데이터 수집에 실패했습니다.\n오류: ${data.message}`);
            }
          })
          .catch((error) => {
            alert("데이터 수집 중 오류가 발생했습니다.");
          })
          .finally(() => {
            btn.textContent = originalText;
            btn.disabled = false;
          });
    });
  }

  function getCityDisplayName(cityValue) {
    const cityMap = {
      seoul: "서울특별시",
      busan: "부산광역시",
      daegu: "대구광역시",
      incheon: "인천광역시",
      gwangju: "광주광역시",
      daejeon: "대전광역시",
      ulsan: "울산광역시",
      gyeonggi: "경기도",
      gangwon: "강원특별자치도",
      chungbuk: "충청북도",
      chungnam: "충청남도",
      jeonbuk: "전라북도",
      jeonnam: "전라남도",
      gyeongbuk: "경상북도",
      gyeongnam: "경상남도",
      jeju: "제주특별자치도",
    };
    return cityMap[cityValue] || cityValue;
  }

  window.openFileUploadModal = function () {
    const modal = document.getElementById("fileUploadModal");
    if (modal) {
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeFileUploadModal = function () {
    const modal = document.getElementById("fileUploadModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";
    }
  };

  function updateStats() {
    fetch("/api/stats")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const stats = data.data;
            const totalElement = document.querySelector(
                ".stats-card:nth-child(1) .stats-value"
            );
            const validCorpRegNoElement = document.querySelector(
                ".stats-card:nth-child(2) .stats-value"
            );
            const validRegionCdElement = document.querySelector(
                ".stats-card:nth-child(3) .stats-value"
            );
            const successRateElement = document.querySelector(
                ".stats-card:nth-child(4) .stats-value"
            );

            if (totalElement) totalElement.textContent = stats.total || 0;
            if (validCorpRegNoElement)
              validCorpRegNoElement.textContent = stats.validCorpRegNo || 0;
            if (validRegionCdElement)
              validRegionCdElement.textContent = stats.validRegionCd || 0;
            if (successRateElement)
              successRateElement.textContent =
                  (stats.successRate || 0).toFixed(1) + "%";
          }
        })
        .catch((error) => {
          console.error("통계 업데이트 실패:", error);
        });
  }

  const fileUploadModal = document.getElementById("fileUploadModal");
  if (fileUploadModal) {
    fileUploadModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeFileUploadModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeFileUploadModal();
    }
  });
});