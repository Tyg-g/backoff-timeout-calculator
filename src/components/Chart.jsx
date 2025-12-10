import { onMount } from 'solid-js';

import { Bar } from 'solid-chartjs';
import { Chart, Title, Tooltip, Legend, Colors } from 'chart.js';


const targetTicks = 12;


export default function TimelineChart(props) {
  onMount(() => {
    Tooltip.positioners.centerTop = centerTopPositioner;
    Chart.register(Title, Tooltip, Legend, Colors, cornerLabelsPluginGen());
    Chart.defaults.font.family = 'monospace';
    Chart.defaults.font.size = 10;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation = false;
  })

  const segmentValues = [50, 250, 50, 500, 50, 1000, 50, 2000, 50, 2000, 50, 2000, 50, 2000, 50];
  const total = segmentValues.reduce((a, b) => a + b, 0);

  // Build one dataset per segment to get a stacked bar
  const datasets = segmentValues.map((v, i) => ({
    label: `Segment ${i + 1}`,
    data: [v],
    backgroundColor: i % 2 === 0 ? '#1e88e5' : '#5554',
    borderColor: '#0000',
    borderWidth: (i%2) ? { top: 6, right: 1, bottom: 6, left: 0 } : 0,
    stack: 'Timeline'
  }));

  const chartData = {
    labels: ['Timeline'],
    datasets,
  };

  const roughStep = total / targetTicks;

  const chartOptions = {
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
        max: total,
        ticks: {
          stepSize: niceStep(roughStep),
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
        display: false
      },
      xTop: {
        type: 'linear',
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
      legend: {
        display: true,
        align: 'end',
        labels: {
            filter: (legendItem, chartData) => legendItem.datasetIndex < 2,
            boxWidth: 12,
            boxHeight: 12,
            padding: 15,
        },
        onClick: () => {}, // disable clicking
      },
      tooltip: {
        position: 'centerTop',
        padding: 10,
        cornerRadius: 3,
        backgroundColor: '#151515',
        xAlign: 'center',
        yAlign: 'bottom',
        caretSize: 6,
        caretPadding: 20,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].dataset.label,
          label: (context) => [` Length: ${context.raw}ms`, ` Start: __ms`],
        }
      },
    }
  };

  return <Bar data={chartData} options={chartOptions} />;
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


function cornerLabelsPluginGen() {
  return {
    id: 'cornerLabels',
    afterDraw(chart, args, pluginOptions) {
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
      ctx.font = `${fontSize}px ${Chart.defaults.font.family || 'sans-serif'}`;

      ctx.textAlign = 'left';
      ctx.fillText(startText, left + offsetX, top + offsetY);

      ctx.textAlign = 'right';
      ctx.fillText(stopText, right - offsetX, top + offsetY);

      ctx.restore();
    }
  }
}
