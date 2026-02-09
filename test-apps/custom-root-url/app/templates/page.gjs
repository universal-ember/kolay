import { Page } from "kolay/components";

<template>
  <Page>
    <:pending>
      <div class="loading-page" role="status">
        Loading, compiling, etc
      </div>
    </:pending>

    <:error as |error|>
      <div style="border: 1px solid red; padding: 1rem;" data-page-error role="alert">
        {{error}}
      </div>
    </:error>

    <:success as |Prose|>
      <Prose />
    </:success>

  </Page>
</template>
