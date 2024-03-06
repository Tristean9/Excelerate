// router/index.js
import { createRouter, createWebHistory} from "vue-router";
import Demo from "@/components/demo.vue";
import ExcelFieldRuleMaker from "@/components/ExcelFieldRuleMaker.vue";
import ExcelFieldSelector from "@/components/ExcelFieldSelector.vue";
import ExcelFileUploader from "@/components/ExcelFileUploader.vue";

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
        path: "/field-rule-maker/:data",
        name: "fieldRuleMaker",
        component: ExcelFieldRuleMaker
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;