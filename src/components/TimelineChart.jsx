import { onMount } from 'solid-js';
import { isServer } from "solid-js/web";

import { Bar } from 'solid-chartjs';
import { Chart, Title, Tooltip, Legend, Colors, LinearScale, CategoryScale, BarElement } from 'chart.js';


const targetTicks = 12;


export default function TimelineChart(props) {
  onMount(() => {
    if (isServer) return;

    Tooltip.positioners.centerTop = centerTopPositioner;
    Chart.defaults.font.family = 'IBM Plex Mono';
    Chart.defaults.font.size = 10;
    //Chart.defaults.color = "#777";
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation = false;
    Chart.register(Title, Tooltip, Legend, Colors, LinearScale, CategoryScale, BarElement, cornerLabelsPluginGen(), overlayTitlePluginGen());

  })

  const data = () => props.data;

  const datatsets = () => {
    const res = [];

    for(const tlItem of data().timeline) {
      res.push({
        label: (tlItem.attempt === 1) ? 'Attempt' : `Retry ${tlItem.attempt-1}`,
        data: [data().responseTimeMs],
        startAtMs: tlItem.timestampMs,
        backgroundColor: '#1e88e5',
        stack: 'Timeline'
      });

      if (tlItem.delayAfterMs > 0)
        res.push({
          label: 'Delay',
          data: [tlItem.delayAfterMs],
          startAtMs: tlItem.timestampMs + data().responseTimeMs,
          backgroundColor: '#5554',
          borderColor: '#0000',
          borderWidth: { top: 6, right: 1, bottom: 6, left: 0 },
          stack: 'Timeline'
        });
    }//for

    return res;
  };

  const chartData = () => ({
    labels: ['Timeline'],
    datasets: datatsets(),
  });

  const totalTimeMs = () => data().totalTimeMs;
  const roughStep = () => totalTimeMs() / targetTicks;

  const chartOptions = () => ({
    indexAxis: 'y',
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
    layout: {
      padding: { left: 30, right: 30 }
    },
    datasets: {
      bar: {
        barThickness: 25, //px
        //minBarLength: 2,  //px
        //inflateAmount: 5,
      }
    },
    scales: {
      x: {
        stacked: true,
        display: true,
        beginAtZero: true,
        max: totalTimeMs(),
        ticks: {
          stepSize: niceStep(roughStep()),
          maxTicksLimit: targetTicks + 2,
          callback(value, index, ticks) {
            if (value === 0) return '0';
            value /= 1e3;
            const last = index === ticks.length - 1;
            const digits = 1 + 1*last;
            return value.toFixed(digits) + 's' + (last ? ' ' : '');
          }
        }
      },
      y: {
        stacked: true,
        display: false,
      },
      xTop: {
        //type: 'line',
        position: 'top',
        ticks: { display: false },
        grid: {
          drawOnChartArea: false, // no extra vertical grid lines
          drawTicks: false
        },
        border: { display: true } // this draws the top horizontal line
      }
    },
    plugins: {
      overlayTitle: {
        text: "Timeline",
        yScaleId: 'y',
        offsetY: -20,
        offsetX: 1,
        color: '#6669',
        font: {
          weight: '300',
        },
      },
      cornerLabels: {
        show: true,
        color: '#666a',
      },
      legend: {
        display: true,
        align: 'end',
        labels: {
            filter: (legendItem) => legendItem.datasetIndex < 2,
            boxWidth: 12,
            boxHeight: 12,
            padding: 15,
        },
        onClick: () => {}, // disable clicking
      },
      tooltip: {
        position: 'centerTop',
        padding: 14,
        cornerRadius: 3,
        titleColor: '#999',
        bodyColor: '#999',
        backgroundColor: '#151515ff',
        xAlign: 'center',
        yAlign: 'bottom',
        caretSize: 6,
        caretPadding: 20,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        titleMarginBottom: 12,
        callbacks: {
          title: (contexts) => contexts[0].dataset.label,
          label: (context) => [
            `  Start:  ${tooltipMsToStr(context.dataset.startAtMs, false)}`,
            `  Length: ${tooltipMsToStr(context.raw, true)}`
          ],
        }
      },
    }
  });

  return <Bar data={chartData()} options={chartOptions()} />;
}


function niceStep(value) {
  const pow10 = Math.pow(10, Math.floor(Math.log10(value)));
  const base = value / pow10;
  let niceBase;
  if (base <= 1) niceBase = 1;
  else if (base <= 2) niceBase = 2;
  else if (base <= 5) niceBase = 5;
  else niceBase = 10;
  return niceBase * pow10;
}


function centerTopPositioner(items, eventPosition) {
  if (!items.length) return false;

  const el = items[0].element; // the bar element (segment)
  const { x, y, height, width } = el;
  const borderInset = el.options.borderWidth.top ?? 0;
  return {
    x: x - width / 2,
    y: y + borderInset,
  };
}


// Overlay title that does NOT affect layout
function overlayTitlePluginGen() {
  return {
    id: "overlayTitle",

    beforeDraw(chart, _args, opts) {
      const text = opts?.text;
      if (typeof text !== "string" || !text.trim()) return;

      const yScaleId = opts?.yScaleId ?? "y";          // vertical axis id
      const yScale = chart.scales?.[yScaleId];
      if (!yScale) return;

      const { ctx, chartArea } = chart;

      // Position: x from the vertical axis, y from chartArea.top
      const x = yScale.left + (opts?.offsetX ?? 0);
      const y = chartArea.top + (opts?.offsetY ?? -8); // default: slightly above plot area

      ctx.save();

      // Defaults (match Chart.js defaults unless you override)
      const color = opts?.color ?? chart.options?.color ?? "#666";

      if (opts?.font) {
        const baseFont = chart.options?.font;

        const weight = opts?.font?.weight ?? baseFont.weight ?? "normal";
        const size = opts?.font?.size ?? baseFont.size ?? 12;
        const style = opts?.font?.style ?? baseFont.style ?? "normal";
        const family = opts?.font?.family ?? baseFont.family ?? "monospace";

        ctx.font = `${style} ${weight} ${size}px ${family}`;
      }

      ctx.fillStyle = color;
      ctx.textAlign = opts?.align ?? "left";
      ctx.textBaseline = opts?.baseline ?? "top";

      ctx.fillText(text, x, y);

      ctx.restore();
    },
  };//return
};


function cornerLabelsPluginGen() {
  return {
    id: 'cornerLabels',
    beforeDraw(chart, args, pluginOptions) {
      if (pluginOptions.show !== true)
        return;

      const { ctx, chartArea } = chart;
      const { left, right, top } = chartArea;

      const startText = pluginOptions.startText || 'Start';
      const stopText = pluginOptions.stopText || 'End';
      const color = pluginOptions.color || '#6668';
      const fontSize = pluginOptions.fontSize || 10;
      const offsetY = pluginOptions.offsetY || 2;   // space below chart area
      const offsetX = pluginOptions.offsetX || 1;   // space to the chart area edge

      ctx.save();
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      ctx.font = `${fontSize}px ${Chart.defaults.font.family || 'monospace'}`;

      ctx.textAlign = 'left';
      ctx.fillText(startText, left + offsetX, top + offsetY);

      ctx.textAlign = 'right';
      ctx.fillText(stopText, right - offsetX, top + offsetY);

      ctx.restore();
    }
  }
}

function tooltipMsToStr(ms, large) {
  if (large ? ms < 10000 : ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms/1000).toFixed(2)}s`;

  const s = ms / 1000;

  const min = Math.floor(s / 60);
  const sec = (s % 60);

  return `${min}m ${(sec).toFixed(2)}s`;
}
