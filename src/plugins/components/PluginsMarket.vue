<script setup lang="ts">
// @ts-expect-error data 是 vitepress 的隐式导出
import { data as _updateTime } from "../data/update-time.data";
import { data as plugins } from "../data/plugins.data";
import PluginsList from "../components/PluginsList.vue";
import HeartFilledIcon from "./icons/HeartFilledIcon.vue";
const updateTime = _updateTime["lastUpdate"];
import PageHeader from "@theme/components/PageHeader.vue";
</script>

<template>
  <el-container>
    <el-header height="fit-content">
      <PageHeader
        title="Zotero 插件商店"
        :description="'更新时间：' + updateTime"
        :actions="[
          {
            text: '🏪 请求收录插件',
            link: 'https://github.com/zotero-chinese/zotero-plugins',
          },
          {
            text: '🏆 插件排行榜',
            link: '/charts',
          },
        ]"
      />
    </el-header>
    <el-main>
      <PluginsList :plugins="plugins" />
    </el-main>
    <el-footer>
      <div class="button-group">
        <el-button type="primary" plain tag="a" href="./value-added">
          付费插件列表
        </el-button>
        <el-button type="primary" plain tag="a" href="./deprecated">
          停止维护的插件列表
        </el-button>
      </div>
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

<style scoped>
.el-footer {
  text-align: center;
  padding-bottom: 2rem;
  height: 100%;
}
</style>
