// router/index.js
import { createRouter, createWebHistory} from "vue-router";
import Demo from "@/components/demo.vue";
import ExcelFieldRuleMaker from "@/components/ExcelFieldRuleMaker.vue";
import ExcelFieldSelector from "@/components/ExcelFieldSelector.vue";
import ExcelFileUploader from "@/components/ExcelFileUploader.vue";
import ExcelFieldRuleShower from "@/components/ExcelFieldRuleShower.vue";

const routes = [
    {   path: "/",
        name: "excelFiledUploader",
        component: ExcelFileUploader
    },
    {   path: '/excel-field-selector',
        name: 'excelFieldSelector',
        component: ExcelFieldSelector
    },
    {
        path: "/excel-field-rule-maker/",
        name: "excelFieldRuleMaker",
        component: ExcelFieldRuleMaker
    },
    {
        path: "/field-rule-shower/",
        name: "excelFieldRuleShower",
        component: ExcelFieldRuleShower
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;