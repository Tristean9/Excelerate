// router/index.js
import { createRouter, createWebHashHistory } from "vue-router";
import ExcelFieldRuleMaker from "@/views/ExcelFieldRuleMaker.vue";
import ExcelFileUploader from "@/views/ExcelFileUploader.vue";
import ExcelFieldSelector from "@/views/ExcelFieldSelector.vue";
import ExcelFieldRuleShower from "@/views/ExcelFieldRuleShower.vue";

import ExcelRuleUploader from "@/views/ExcelRuleUploader.vue";
import ExcelDataChecker from "@/views/ExcelDataChecker.vue";

import ContactUploader from "@/views/ContactUploader.vue";
import ExampleDataSelector from "@/views/ExampleDataSelector.vue"
import ContactChecker from "@/views/ContactChecker.vue";

import SplitUploader from "@/views/SplitUploader.vue";
import SplitSelector from "@/views/SplitSelector.vue";

import Home from "@/views/Home.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/excel-file-uploader",
        name: "ExcelFileUploader",
        component: ExcelFileUploader
    },
    {
        path: '/excel-field-selector',
        name: 'ExcelFieldSelector',
        component: ExcelFieldSelector
    },
    {
        path: "/excel-field-rule-maker/",
        name: "ExcelFieldRuleMaker",
        component: ExcelFieldRuleMaker
    },
    {
        path: "/field-rule-shower/",
        name: "ExcelFieldRuleShower",
        component: ExcelFieldRuleShower
    },
    {
        path: "/excel-rule-uploader/",
        name: "ExcelRuleUploader",
        component: ExcelRuleUploader
    },
    {
        path: "/excel-data-checker/",
        name: "ExcelDataChecker",
        component: ExcelDataChecker
    },
    {
        path: "/contact-uploader/",
        name: "ContactUploader",
        component: ContactUploader
    },
    {
        path: "/example-data-selector/",
        name: "ExampleDataSelector",
        component: ExampleDataSelector
    },
    {
        path: "/contact-checker/",
        name: "ContactChecker",
        component: ContactChecker
    },
    {
        path: "/split-uploader/",
        name: "SplitUploader",
        component: SplitUploader
    },
    {
        path: "/split-selector/",
        name: "SplitSelector",
        component: SplitSelector
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;