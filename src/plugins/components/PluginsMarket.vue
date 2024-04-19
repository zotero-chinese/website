<template>
  <el-container>
    <el-header class="vp-doc">
      <h2>Zotero 插件商店</h2>
      <el-text>更新时间：{{ updateTime }}</el-text>
      <!-- <el-button type="primary" plain>请求收录插件</el-button> -->
    </el-header>
    <el-main>
      <PluginsList :plugins="plugins" />
    </el-main>
    <el-footer>
      <p>
        <el-text>
          Zotero 中文交流群
          913637964，617148016，893963769，666489129，145248977，317995116，962963257（加一个群即可）。独学而无友，则孤陋而寡闻。
        </el-text>
      </p>
      <p>
        <el-text>
          如果你对本页面有任何建议或反馈，请
          <el-link type="primary" href="https://www.kdocs.cn/wo/sl/v14cwJXX">
            填写表格
          </el-link>
          或前往
          <el-link
            type="primary"
            href="https://github.com/zotero-chinese/zotero-plugins"
          >
            GitHub 仓库提 issue
          </el-link>
          。
        </el-text>
      </p>
      <p>
        <el-text>
          Zotero 中文社区
          <el-icon color="#F56C6C"><HeartFilledIcon /></el-icon>
          荣誉出品
        </el-text>
      </p>

      <p>
        <el-link
          href="https://badges.toozhao.com/stats/01H9T10RA7708BEZZ78B6ZW9VV"
        >
          <img
            src="https://badges.toozhao.com/badges/01H9T10RA7708BEZZ78B6ZW9VV/green.svg"
            alt="Page Views Count"
          />
        </el-link>
      </p>
    </el-footer>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PluginsList from "../components/PluginsList.vue";
import type { PluginInfo } from "../types/plugin-info";
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as plugins } from "../data/plugins.data";
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as updateTime } from "../data/update-time.data";
import HeartFilledIcon from "./icons/HeartFilledIcon.vue";

export default defineComponent({
  name: "PluginsMarket",
  components: {
    PluginsList,
    HeartFilledIcon,
  },
  data() {
    return {
      plugins: plugins as unknown as PluginInfo[],
      updateTime: updateTime["lastUpdate"],
    };
  },
});
</script>

<style scoped>
.el-header {
  height: max-content;
  display: flex;
  align-content: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 50px;
}
.el-footer {
  text-align: center;
  padding-bottom: 40px;
  height: 100%;
}
p {
  vertical-align: middle;
}
h2 {
  border-top: none;
}
</style>
