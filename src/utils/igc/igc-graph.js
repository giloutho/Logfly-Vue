import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

// context : objet optionnel pour mousemove (graphInfoDiv, _feature, fullmap, hoverMarker)
export function createAltitudeChart(fixes, chartId = 'chart', context) {
  if (!fixes || fixes.length === 0) return

  const timestamps = []
  const altitudes = []
  const speeds = []
  const varios = []

  const startTime = fixes[0].timestamp / 1000

  for (let i = 0; i < fixes.length; i++) {

    timestamps.push((fixes[i].timestamp / 1000) - startTime)
    altitudes.push(fixes[i].gpsAltitude || 0)


    if (i > 0) {
      const dt = (fixes[i].timestamp - fixes[i-1].timestamp) / 1000
      if (dt > 0) {
        const dz = fixes[i].gpsAltitude - fixes[i-1].gpsAltitude
        varios.push(dz / dt)

        const dx = Math.sqrt(
          Math.pow(fixes[i].latitude - fixes[i-1].latitude, 2) +
          Math.pow(fixes[i].longitude - fixes[i-1].longitude, 2)
        ) * 111000
        speeds.push((dx / dt) * 3.6)
      } else {
        varios.push(0)
        speeds.push(0)
      }
    } else {
      varios.push(0)
      speeds.push(0)
    }
  }

  const data = [timestamps, altitudes]

  const opts = {
    width: document.getElementById(chartId).offsetWidth,
    height: 140,
    scales: {
      x: { time: false },
    },
    series: [
      { label: 'Temps (s)' },
      {
        label: 'Altitude (m)',
        stroke: '#1976d2',
        width: 2,
        fill: 'rgba(25, 118, 210, 0.1)'
      }
    ],
    axes: [
      {
        values: (u, ticks) => {
          // ticks sont des secondes écoulées depuis le début
          return ticks.map(sec => {
            const t = new Date(fixes[0].timestamp + sec * 1000)
            return t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0')
          })
        }
      },
      { size: 50, label: 'Altitude (m)' }
    ]
  }

  const uplot = new uPlot(opts, data, document.getElementById(chartId))

  // Extraction des heures pour chaque point
  const arrayHour = fixes.map(fix => new Date(fix.timestamp))
  // Altitude sol si disponible
  const y2 = fixes.map(fix => fix.groundAltitude)

  // Ajout de l'event mousemove pour affichage dynamique
  uplot.root.addEventListener('mousemove', e => {
    if (!uplot.cursor) return
    const idx = uplot.cursor.idx
    if (idx != null && idx >= 0 && idx < fixes.length) {
      const heure = arrayHour[idx]
      const alt = altitudes[idx]
      const sol = y2[idx]
      const hground = sol !== undefined && sol !== null ? (alt - sol).toFixed(0) : 'N/A'
      const vario = varios[idx]
      const speed = speeds[idx]
      // Affichage des infos du point survolé
      if (context && context.graphInfoDiv) {
        context.graphInfoDiv.innerHTML =
          `<span style=\"color:#1a6dcc;font-weight:bold;\">🕒 ${heure.getUTCHours().toString().padStart(2, '0')}:${heure.getUTCMinutes().toString().padStart(2, '0')}</span>
          &nbsp;|&nbsp;
          <span style=\"color:#1976d2;\">⛰️ ${alt.toFixed(0)} m</span>
          &nbsp;|&nbsp;
          <span style=\"color:Sienna;\">🟫 ${sol !== undefined ? sol.toFixed(0) : 'N/A'} m</span>
          &nbsp;|&nbsp;
          <span style=\"color:#6d4c41;\">↕️ ${hground} m</span>
          &nbsp;|&nbsp;
          <span style=\"color:#388e3c;\">⬇️ ${vario.toFixed(2)} m/s</span>
          &nbsp;|&nbsp;
          <span style=\"color:#e65100;\">➡️ ${speed.toFixed(0)} km/h</span>`
      }
      // Marker sur la carte
      if (context && context._feature && context.fullmap) {
        const coords = context._feature.geometry.coordinates
        const coord = coords[idx]
        if (coord) {
          const latlng = [coord[1], coord[0]]
          if (context.hoverMarker) {
            context.fullmap.removeLayer(context.hoverMarker)
          }
          context.hoverMarker = L.circleMarker(latlng, {
            radius: 7,
            color: 'orange',
            fillColor: 'yellow',
            fillOpacity: 0.8,
            weight: 2
          }).addTo(context.fullmap)
        }
      }
    }
  })
  return uplot
}
