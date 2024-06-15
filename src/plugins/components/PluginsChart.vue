<template>
  <PageHeader
    title="🤩 Awesome Zotero Plugins"
    :actions="[{ text: '🏪 插件商店', link: '/plugins' }]"
  />

  <div
    id="container"
    :class="{ 'highcharts-dark': darkMode, 'highcharts-light': !darkMode }"
  >
    Loading ...
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as chartsData } from "../data/charts.data";
import { useData } from "vitepress";
import { onMounted } from "vue";
import PageHeader from "@theme/components/PageHeader.vue";

import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
HighchartsMore(Highcharts);
import WordCloudGraph from "highcharts/modules/wordcloud";
WordCloudGraph(Highcharts);
import HighchartsBoost from "highcharts/modules/boost";
HighchartsBoost(Highcharts);
import HighStock from "highcharts/modules/stock";
HighStock(Highcharts);
import MouseWheelZoom from "highcharts/modules/mouse-wheel-zoom";
MouseWheelZoom(Highcharts);
import ParallelCoordinates from "highcharts/modules/parallel-coordinates";
ParallelCoordinates(Highcharts);
import VariablePieGraph from "highcharts/modules/variable-pie";
VariablePieGraph(Highcharts);
import HighchartsExporting from "highcharts/modules/exporting";
HighchartsExporting(Highcharts);
import HighchartsExportData from "highcharts/modules/export-data";
HighchartsExportData(Highcharts);
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
NoDataToDisplay(Highcharts);

import Dashboards from "@highcharts/dashboards";
import type { Board } from "@highcharts/dashboards";
import DataGrid from "@highcharts/dashboards/datagrid";
import LayoutModule from "@highcharts/dashboards/modules/layout";
LayoutModule(Dashboards);
Dashboards.HighchartsPlugin.custom.connectHighcharts(Highcharts);
Dashboards.DataGridPlugin.custom.connectDataGrid(DataGrid);
Dashboards.PluginHandler.addPlugin(Dashboards.HighchartsPlugin);
Dashboards.PluginHandler.addPlugin(Dashboards.DataGridPlugin);

const darkMode = useData().isDark;

onMounted(() => {
  // @ts-ignore
  Math.wordCloudEasing = function (pos) {
    if (pos < 1 / 2.75) return 7.5625 * pos * pos;
    if (pos < 2 / 2.75) return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    if (pos < 2.5 / 2.75) return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
  };
  loadChartsJson();
});

function loadChartsJson() {
  chartsData.editMode = {
    enable: false,
  };

  for (const com of chartsData.components) {
    if (com.chartOptions?.exporting) {
      (
        com.chartOptions.exporting.menuItemDefinitions.invertSelection as any
      ).onclick = function (this: Highcharts.Chart) {
        this.series.forEach((series) => series.setVisible(undefined, false));
        this.redraw();
      };
    }
  }
  (
    chartsData.components[1].chartOptions!.plotOptions!.series.point!
      .events as any
  ).click = function (this: any) {
    // @ts-ignore
    location.href = "https://github.com/" + this.custom.repo;
  };
  console.debug(Dashboards.board("container", chartsData as Board.Options));

  // Highcharts.Templating.helpers.log = function () {
  //   console.debug(arguments[0].ctx);
  // };
}
</script>

<style scope>
@import url("highcharts/css/highcharts.css");
@import url("@highcharts/dashboards/css/dashboards.css");
@import url("@highcharts/dashboards/css/datagrid.css");

:root {
  --highcharts-neutral-color-5: #fff;
  --highcharts-color-101: #a371f7;
  --highcharts-color-102: #3fb950;
}

.highcharts-dashboards,
.highcharts-dashboards-wrapper {
  background-color: unset;
}

.highcharts-color-101 {
  fill: var(--highcharts-color-101);
  stroke: var(--highcharts-color-101);
}

.highcharts-color-102 {
  fill: var(--highcharts-color-102);
  stroke: var(--highcharts-color-102);
}

.stargazers-pie-plugin {
  stroke-width: 2px;
}

.trending-tooltip {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: var(--highcharts-neutral-color-80);
}

.trending-tooltip > :first-child {
  background-size: cover;
  border-radius: 8px;
  margin-right: 8px;
  height: 56px;
  width: 56px;
}

.trending-tooltip > :last-child {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.trending-tooltip > :last-child > :first-child {
  border-bottom: 1px solid;
  margin-bottom: 3px;
}

.trending-tooltip > :last-child > :last-child {
  display: flex;
}
</style>
