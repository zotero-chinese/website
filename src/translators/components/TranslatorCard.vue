<script setup>
const props = defineProps(["translator"]);

const translator = props.translator;
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <b>
          <el-text tag="b" size="large">{{ translator.zhLabel }}</el-text>
        </b>
      </div>
    </template>

    <el-space direction="vertical" alignment="normal">
      <el-text>
        <el-icon><User /></el-icon>
        {{ translator.creator }}
      </el-text>

      <el-text>
        <el-icon><Link /></el-icon>
        {{ translator.target }}
      </el-text>

      <el-text>
        <el-icon><DataLine /></el-icon>
        {{ translator.lastUpdated }}
      </el-text>
    </el-space>
  </el-card>
</template>
