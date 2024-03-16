// router/index.js
import { createRouter, createWebHistory} from "vue-router";
import Demo from "@/components/demo.vue";
import ExcelFieldRuleMaker from "@/views/ExcelFieldRuleMaker.vue";
import ExcelFieldSelector from "@/views/ExcelFieldSelector.vue";
import ExcelFileUploader from "@/views/ExcelFileUploader.vue";
import ExcelFieldRuleShower from "@/views/ExcelFieldRuleShower.vue";

import ExcelRuleUploader from "@/views/ExcelRuleUploader.vue";
import ExcelDataChecker from "@/views/ExcelDataChecker.vue";
import Home from "@/views/Home.vue";

const routes = [
    {   path: "/",
        name: "Home",
        component: Home
    },
    {   path: "/excel-file-uploader",
        name: "ExcelFileUploader",
        component: ExcelFileUploader
    },
    {   path: '/excel-field-selector',
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
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;