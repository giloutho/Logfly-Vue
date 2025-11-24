import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

export function createAltitudeChart(fixes, chartId = 'chart') {
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

  return new uPlot(opts, data, document.getElementById(chartId))
}
