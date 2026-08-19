// Beechclub Flying Club — shared site behavior

document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Contact form: friendly inline confirmation.
  // Works as-is with Netlify Forms (form has data-netlify="true").
  // If you deploy elsewhere, point the form's "action" at your own
  // form handler (e.g. Formspree) or a serverless function.
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      // Let Netlify (or another host's form handler) actually process
      // the submission — we just show a friendly message afterward if
      // JS handles the redirect. If you're testing locally, this will
      // prevent a real network error and simulate success instead.
      var isLocal = window.location.protocol === "file:";
      if (isLocal) {
        e.preventDefault();
        var success = document.querySelector("#form-success");
        if (success) {
          success.style.display = "block";
          form.reset();
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }

  // Highlight current nav link based on path
  var current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  loadWeather();
});

// Live weather panel: current conditions for KGTU and nearby airports.
// Uses the National Weather Service's public API (api.weather.gov), which
// supports cross-origin requests from the browser and needs no API key.
// Note: NWS does not reliably populate the raw METAR string for every
// station, so we decode the structured fields ourselves and link out to
// aviationweather.gov for the official raw METAR/TAF.
function loadWeather() {
  var grid = document.querySelector("#metar-grid");
  if (!grid) return;

  var stations = [
    { id: "KGTU", label: "Georgetown Muni (Home Base)" },
    { id: "KAUS", label: "Austin-Bergstrom Intl" },
    { id: "KEDC", label: "Austin Executive" },
    { id: "KGRK", label: "Killeen-Ft Hood Regional" },
    { id: "KTPL", label: "Draughon-Miller Central Texas" }
  ];

  Promise.all(
    stations.map(function (s) {
      return fetch("https://api.weather.gov/stations/" + s.id + "/observations/latest", {
        headers: { Accept: "application/geo+json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("bad response for " + s.id);
          return res.json();
        })
        .then(function (data) {
          return { station: s, props: data.properties };
        })
        .catch(function () {
          return { station: s, props: null };
        });
    })
  ).then(function (results) {
    var allFailed = results.every(function (r) { return !r.props; });
    if (allFailed) {
      grid.innerHTML =
        '<p class="form-note">Live weather is temporarily unavailable. ' +
        '<a href="https://aviationweather.gov/data/metar/?ids=' +
        stations.map(function (s) { return s.id; }).join(",") +
        '" target="_blank" rel="noopener">Check current METARs on aviationweather.gov</a>.</p>';
      return;
    }
    grid.innerHTML = results.map(renderMetarCard).join("");
  });
}

function renderMetarCard(result) {
  var s = result.station;
  var p = result.props;
  var rawLink = 'https://aviationweather.gov/data/metar/?ids=' + s.id;

  if (!p) {
    return (
      '<div class="metar-card">' +
      '<div class="metar-card-head"><div class="metar-station">' + s.id +
      '<span class="metar-name">' + s.label + '</span></div></div>' +
      '<p class="form-note">Observation unavailable. <a href="' + rawLink +
      '" target="_blank" rel="noopener">Check aviationweather.gov</a></p>' +
      '</div>'
    );
  }

  var visMi = numOrNull(p.visibility && p.visibility.value);
  if (visMi !== null) visMi = visMi / 1609.34;

  var ceilingFt = null;
  var hasCloudData = Array.isArray(p.cloudLayers) && p.cloudLayers.length > 0;
  if (hasCloudData) {
    p.cloudLayers.forEach(function (layer) {
      if ((layer.amount === "BKN" || layer.amount === "OVC") && layer.base && layer.base.value != null) {
        var baseFt = layer.base.value * 3.28084;
        if (ceilingFt === null || baseFt < ceilingFt) ceilingFt = baseFt;
      }
    });
  }

  var category = flightCategory(visMi, hasCloudData ? ceilingFt : null);
  var catClass = { VFR: "fc-vfr", MVFR: "fc-mvfr", IFR: "fc-ifr", LIFR: "fc-lifr" }[category] || "";

  var tempC = numOrNull(p.temperature && p.temperature.value);
  var tempStr = tempC !== null ? Math.round(tempC * 9 / 5 + 32) + "°F / " + Math.round(tempC) + "°C" : "—";

  var windDir = numOrNull(p.windDirection && p.windDirection.value);
  var windKtRaw = numOrNull(p.windSpeed && p.windSpeed.value);
  var windKt = windKtRaw !== null ? Math.round(windKtRaw / 1.852) : null;
  var gustKtRaw = numOrNull(p.windGust && p.windGust.value);
  var gustKt = gustKtRaw !== null ? Math.round(gustKtRaw / 1.852) : null;
  var windStr = "—";
  if (windKt !== null) {
    windStr = windKt === 0 ? "Calm" : (windDir !== null ? windDir + "°" : "—") + " @ " + windKt + " kt" + (gustKt ? " G" + gustKt : "");
  }

  var visStr = visMi !== null ? (visMi >= 10 ? "10+ mi" : visMi.toFixed(1) + " mi") : "—";

  var altimPa = numOrNull(p.barometricPressure && p.barometricPressure.value);
  var altimStr = altimPa !== null ? (altimPa / 3386.39).toFixed(2) + '" Hg' : "—";

  var ageStr = "";
  if (p.timestamp) {
    var mins = Math.round((Date.now() - new Date(p.timestamp).getTime()) / 60000);
    if (mins < 1) ageStr = "just now";
    else if (mins === 1) ageStr = "1 min ago";
    else if (mins < 60) ageStr = mins + " min ago";
    else ageStr = Math.round(mins / 60) + " hr ago";
  }

  return (
    '<div class="metar-card">' +
    '<div class="metar-card-head">' +
    '<div class="metar-station">' + s.id + '<span class="metar-name">' + s.label + '</span></div>' +
    (category ? '<span class="metar-badge ' + catClass + '">' + category + '</span>' : "") +
    "</div>" +
    '<div class="metar-stats">' +
    "<div><span>Wind</span>" + windStr + "</div>" +
    "<div><span>Visibility</span>" + visStr + "</div>" +
    "<div><span>Temp</span>" + tempStr + "</div>" +
    "<div><span>Altimeter</span>" + altimStr + "</div>" +
    "</div>" +
    '<div class="metar-meta">' +
    (ageStr ? "Observed " + ageStr + " &middot; " : "") +
    '<a href="' + rawLink + '" target="_blank" rel="noopener">Raw METAR &amp; TAF ↗</a>' +
    "</div>" +
    "</div>"
  );
}

function flightCategory(visMi, ceilingFt) {
  if (visMi === null && ceilingFt === null) return null;
  var v = visMi === null ? Infinity : visMi;
  var c = ceilingFt === null ? Infinity : ceilingFt;
  if (v < 1 || c < 500) return "LIFR";
  if (v < 3 || c < 1000) return "IFR";
  if (v <= 5 || c <= 3000) return "MVFR";
  return "VFR";
}

function numOrNull(v) {
  return typeof v === "number" && !isNaN(v) ? v : null;
}
