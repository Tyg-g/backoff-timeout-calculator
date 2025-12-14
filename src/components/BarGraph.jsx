import { onMount } from 'solid-js';

import { Bar } from 'solid-chartjs';
import { Chart, Title, Tooltip, Legend, Colors } from 'chart.js';


export default function BarGraph(props) {
  onMount(() => {
    Chart.defaults.font.family = 'IBM Plex Mono';
    Chart.defaults.font.size = 10;
    //Chart.defaults.color = "#666";
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation = false;
  })

  const data = () => props.data;

  const datatsets = () => [
    {
      label: 'Delay',
      data: [null, ...data().timeline.map( (item) => item.delayAfterMs)],
      backgroundColor: '#5554',
    },
    {
      label: `Attempt`,
      data: data().timeline.map( () => data().responseTimeMs),
      backgroundColor: '#1e88e5',
    },
  ];

  const chartData = () => ({
    //labels: ['Start', ...Array(data().timeline.length-1).fill().map((_, i) => [`Retry`,`${i+1}`]), 'End'],
    labels: ['Start', ...Array(data().timeline.length-1).fill().map((_, i) => `${i+1}`), 'End'],
    datasets: datatsets(),
  });

  const chartOptions = () => ({
    interaction: {
      mode: 'index',
      intersect: false,
      //axis: 'y',
    },
    layout: {
      padding: { left: 30, right: 30 }
    },
    datasets: {
      bar: {
        maxBarThickness: 22, //px
      }
    },
    scales: {
      x: {
        stacked: true,
        display: true,
        title: {
          display: true,
          text: "Retries",
          font: {
            weight: '300',
          },
        },
      },
      y: {
        stacked: true,
        display: true,
        title: {
          display: true,
          text: "Delay",
          font: {
            weight: '300',
          },
        },
        ticks: {
          callback: (value, _, ticks) => scaleMsToStr(value, ticks[ticks.length - 1]?.value),
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        align: 'end',
        labels: {
          sort: (a, b) => b.datasetIndex - a.datasetIndex,
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
        },
        onClick: () => {}, // disable clicking
      },
      tooltip: {
        //position: 'centerTop',
        padding: 14,
        cornerRadius: 3,
        titleColor: '#999',
        bodyColor: '#999',
        backgroundColor: '#151515',
        xAlign: 'center',
        yAlign: 'bottom',
        caretSize: 6,
        caretPadding: 20,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        titleMarginBottom: 12,
        filter: (item) => item.parsed.y !== null && item.parsed.y !== 0,
        itemSort: (a, b) => b.datasetIndex - a.datasetIndex,
        callbacks: {
          title: (contexts) => {
            if (!contexts?.[0]) return;
            const label = contexts[0]?.label;
            const isNum = label?.charAt(0) <= '9';
            return isNum ? `Retry ${label}` : label;
          },
          label: (context) => ` ${(context.dataset.label+':').padEnd(8)} ${tooltipMsToStr(context.parsed.y)}`,
        }
      },
    }
  });

  return <Bar data={chartData()} options={chartOptions()} />;
}

function tooltipMsToStr(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms/1000).toFixed(2)}s`;

  const s = ms / 1000;

  const min = Math.floor(s / 60);
  const sec = (s % 60);

  return `${min}m ${(sec).toFixed(2)}s`;
}

function scaleMsToStr(ms, maxMs) {
  if (ms === 0) return `0`;
  if (maxMs <= 2000) return `${ms}ms`;

  return `${(ms/1000).toFixed(1)}s`;
}
